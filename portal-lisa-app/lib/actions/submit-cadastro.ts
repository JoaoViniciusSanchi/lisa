'use server';

import { createServiceRoleClient } from '@/lib/supabase/server';
import { calcFuzzyIndex } from '@/lib/fuzzy/engine';
import { loadFuzzyConfig } from '@/lib/fuzzy/config';
import { DIMENSIONS, DIMENSION_DB_KEY } from '@/lib/fuzzy/types';
import type { FuzzyAnswers } from '@/lib/fuzzy/types';
import type { ExperienciaStatus } from '@/lib/supabase/types';
import { sendEmail } from '@/lib/email/send';

// =============================================================
// PAYLOAD do cadastro completo
// =============================================================

export interface CadastroPayload {
  identificacao: {
    coordNome: string;
    coordEmail: string;
    coordTelefone?: string;
    coordLattes?: string;
    coordVinculo?: string;
    coordDepartamento?: string;
    viceNome?: string;
    viceEmail?: string;
  };
  experiencia: {
    titulo: string;
    historico: string;
    metodologia: string;
    dataInicio?: string;
    dataFim?: string;
    isPerene?: boolean;
    statusExperiencia: 'em_andamento' | 'perene' | 'com_data_fim' | 'encerrada';
    campus?: string;
    municipio?: string;
    uf?: string;
  };
  classificacoes: {
    macroareaPrincipalCodigo?: string;
    macroareasSecundariasCodigos?: string[];
    cnpqGrandeAreaCodigo?: string;
    cnpqSubareaCodigos?: string[];
    odsIds: number[];
    categoriaEditorialNome?: string;
    finalidadeSocialCodigos: string[];
    forproexCodigos: string[];
    publicoAlvoCodigos: string[];
    tipoSolucaoCodigos: string[];
    arranjoCodigos: string[];
  };
  fuzzyAnswers: FuzzyAnswers;
  justificativas: Partial<Record<'P' | 'I' | 'A' | 'S' | 'R', string>>;
  resultados: {
    resultadosImpactos: string;
    desafiosPerspectivas: string;
    publicoBeneficiado?: string;
    numPessoasAtendidas?: number;
    fontesFinanciamento?: string;
    parcerias?: string;
  };
  materiais: {
    instagram?: string;
    siteExterno?: string;
    youtube?: string;
    facebook?: string;
    linksAdicionais?: string;
  };
  termoAceito: boolean;
  meta: {
    ipOrigem?: string;
    userAgent?: string;
  };
}

export interface SubmitResult {
  success: boolean;
  protocolo?: string;
  experienciaId?: string;
  error?: string;
}

// =============================================================
// Upload de imagens — bucket público, validação client+server
// =============================================================

const ANEXO_BUCKET = 'anexos-experiencias';
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

type AnexoSlot = 'capa' | 'secundaria1' | 'secundaria2';

const SLOT_TO_TIPO: Record<AnexoSlot, 'foto_capa' | 'foto_secundaria_1' | 'foto_secundaria_2'> = {
  capa: 'foto_capa',
  secundaria1: 'foto_secundaria_1',
  secundaria2: 'foto_secundaria_2'
};

function extFromMime(mime: string): string {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'bin';
}

// =============================================================
// Server Action — entrada via FormData (carrega os arquivos)
// =============================================================

export async function submitCadastroWithFiles(
  formData: FormData
): Promise<SubmitResult> {
  const payloadRaw = formData.get('payload');
  if (typeof payloadRaw !== 'string') {
    return { success: false, error: 'Payload ausente ou inválido' };
  }

  let payload: CadastroPayload;
  try {
    payload = JSON.parse(payloadRaw) as CadastroPayload;
  } catch {
    return { success: false, error: 'Payload mal-formado' };
  }

  // Coleta os arquivos por slot (se presentes)
  const files: Partial<Record<AnexoSlot, File>> = {};
  for (const slot of ['capa', 'secundaria1', 'secundaria2'] as AnexoSlot[]) {
    const f = formData.get(slot);
    if (f instanceof File && f.size > 0) {
      // Validação server-side (defesa em profundidade)
      if (!ALLOWED_MIME.includes(f.type)) {
        return {
          success: false,
          error: `Arquivo ${slot} tem formato não suportado (${f.type})`
        };
      }
      if (f.size > MAX_SIZE_BYTES) {
        return {
          success: false,
          error: `Arquivo ${slot} excede 5MB`
        };
      }
      files[slot] = f;
    }
  }

  return submitCadastro(payload, files);
}

// =============================================================
// Server Action principal
// =============================================================

export async function submitCadastro(
  payload: CadastroPayload,
  files: Partial<Record<AnexoSlot, File>> = {}
): Promise<SubmitResult> {
  // Validações mínimas server-side (defesa em profundidade)
  if (!payload.termoAceito) {
    return { success: false, error: 'Termo de consentimento não aceito' };
  }
  const camposFaltantes: string[] = [];
  if (!payload.identificacao.coordNome?.trim()) {
    camposFaltantes.push('Nome do coordenador(a)');
  }
  if (!payload.identificacao.coordEmail?.trim()) {
    camposFaltantes.push('E-mail institucional');
  }
  if (!payload.experiencia.titulo?.trim()) {
    camposFaltantes.push('Título da experiência');
  }
  if (camposFaltantes.length > 0) {
    return {
      success: false,
      error: `Campos obrigatórios não preenchidos: ${camposFaltantes.join(', ')}`
    };
  }

  const supabase = createServiceRoleClient();

  // 1. Recalcular fuzzy NO SERVIDOR (decisão 10)
  const config = await loadFuzzyConfig();
  const fuzzyResult = calcFuzzyIndex(payload.fuzzyAnswers, config);

  // Se gate bloqueou, recusa o cadastro mesmo se chegar aqui
  if (fuzzyResult.indice_fuzzy < config.gateTriagemMin) {
    return {
      success: false,
      error: 'Triagem não atende parâmetros mínimos do LISA'
    };
  }

  // 2. Determinar status da experiência baseado no input do form
  const status = mapStatusExperiencia(payload.experiencia.statusExperiencia);

  // 3. Mapear cnpq_subareas, ODS, etc. para IDs
  // (lookup via codigo/nome, evita expor IDs no client)
  // cleanupId: tracking pra rollback no catch (CASCADE limpa children)
  let cleanupId: string | null = null;
  // Caminhos uploadados pro Storage — se algo falhar depois, removemos.
  const uploadedPaths: string[] = [];

  try {
    // ----- Inserir experiencia -----
    const slug = generateSlug(payload.experiencia.titulo);

    const { data: expData, error: expError } = await supabase
      .from('experiencia')
      .insert({
        titulo: payload.experiencia.titulo,
        slug,
        resumo: payload.experiencia.historico.slice(0, 280),
        data_inicio: payload.experiencia.dataInicio || null,
        data_fim: payload.experiencia.dataFim || null,
        is_perene: payload.experiencia.statusExperiencia === 'perene',
        status,
        campus_uff: payload.experiencia.campus || null,
        municipio: payload.experiencia.municipio || null,
        uf: payload.experiencia.uf || null,
        categoria_editorial_id: payload.classificacoes.categoriaEditorialNome
          ? await lookupId(
              supabase,
              'categoria_editorial',
              'nome',
              payload.classificacoes.categoriaEditorialNome
            )
          : null,
        indice_fuzzy: fuzzyResult.indice_fuzzy,
        faixa_fuzzy_atual: fuzzyResult.faixa,
        score_calculado_em: new Date().toISOString(),
        email_contato: payload.identificacao.coordEmail
      })
      .select('id')
      .single();

    if (expError || !expData) {
      throw new Error(`experiencia: ${expError?.message ?? 'falha ao inserir'}`);
    }
    const experienciaId: string = expData.id;
    cleanupId = experienciaId;

    // ----- Inserir experiencia_traducao (PT, original) -----
    const { error: tradError } = await supabase
      .from('experiencia_traducao')
      .insert({
        experiencia_id: experienciaId,
        idioma: 'pt',
        titulo: payload.experiencia.titulo,
        historico: payload.experiencia.historico,
        metodologia: payload.experiencia.metodologia,
        resultados_impactos: payload.resultados.resultadosImpactos,
        desafios_perspectivas: payload.resultados.desafiosPerspectivas,
        is_original: true,
        status_global: 'publicavel'
      });
    if (tradError) throw new Error(`experiencia_traducao: ${tradError.message}`);

    // ----- Inserir experiencia_conteudo -----
    const { error: contError } = await supabase
      .from('experiencia_conteudo')
      .insert({
        experiencia_id: experienciaId,
        email_contato_publico: payload.identificacao.coordEmail,
        instagram: payload.materiais.instagram || null,
        facebook: payload.materiais.facebook || null,
        youtube: payload.materiais.youtube || null,
        site_externo: payload.materiais.siteExterno || null,
        versao_atual: 'bruto',
        texto_bruto_snapshot: {
          historico: payload.experiencia.historico,
          metodologia: payload.experiencia.metodologia,
          resultados_impactos: payload.resultados.resultadosImpactos,
          desafios_perspectivas: payload.resultados.desafiosPerspectivas
        }
      });
    if (contError) throw new Error(`experiencia_conteudo: ${contError.message}`);

    // ----- Inserir pessoas (coord + vice) -----
    const coordId = await upsertPessoa(supabase, {
      nome_completo: payload.identificacao.coordNome,
      email: payload.identificacao.coordEmail,
      vinculo: mapVinculo(payload.identificacao.coordVinculo),
      departamento: payload.identificacao.coordDepartamento || null,
      lattes_url: payload.identificacao.coordLattes || null,
      telefone: payload.identificacao.coordTelefone || null
    });

    await supabase.from('experiencia_pessoa').insert({
      experiencia_id: experienciaId,
      pessoa_id: coordId,
      papel: 'coordenador',
      ordem: 0
    });

    if (payload.identificacao.viceEmail && payload.identificacao.viceNome) {
      const viceId = await upsertPessoa(supabase, {
        nome_completo: payload.identificacao.viceNome,
        email: payload.identificacao.viceEmail
      });
      await supabase.from('experiencia_pessoa').insert({
        experiencia_id: experienciaId,
        pessoa_id: viceId,
        papel: 'vice_coordenador',
        ordem: 1
      });
    }

    // ----- Inserir classificações (N:N) -----
    if (payload.classificacoes.odsIds.length > 0) {
      await supabase.from('experiencia_ods').insert(
        payload.classificacoes.odsIds.map((id, idx) => ({
          experiencia_id: experienciaId,
          ods_id: id,
          is_principal: idx === 0
        }))
      );
    }

    await insertManyByCode(
      supabase,
      'finalidade_social',
      'experiencia_finalidade_social',
      'finalidade_id',
      experienciaId,
      payload.classificacoes.finalidadeSocialCodigos
    );

    await insertManyByCode(
      supabase,
      'area_tematica_forproex',
      'experiencia_forproex',
      'forproex_id',
      experienciaId,
      payload.classificacoes.forproexCodigos
    );

    await insertManyByCode(
      supabase,
      'publico_alvo',
      'experiencia_publico_alvo',
      'publico_alvo_id',
      experienciaId,
      payload.classificacoes.publicoAlvoCodigos
    );

    await insertManyByCode(
      supabase,
      'tipo_solucao',
      'experiencia_tipo_solucao',
      'tipo_solucao_id',
      experienciaId,
      payload.classificacoes.tipoSolucaoCodigos
    );

    await insertManyByCode(
      supabase,
      'arranjo_institucional',
      'experiencia_arranjo',
      'arranjo_id',
      experienciaId,
      payload.classificacoes.arranjoCodigos
    );

    // ----- Inserir macroareas (principal + secundárias) -----
    if (payload.classificacoes.macroareaPrincipalCodigo) {
      const macCodigos = [
        payload.classificacoes.macroareaPrincipalCodigo,
        ...(payload.classificacoes.macroareasSecundariasCodigos ?? [])
      ].slice(0, 3); // 1 principal + até 2 secundárias

      const { data: macroareas } = await supabase
        .from('macroarea_ts')
        .select('id, codigo')
        .in('codigo', macCodigos);

      if (macroareas && macroareas.length > 0) {
        const macRows = macroareas.map((m) => ({
          experiencia_id: experienciaId,
          macroarea_id: m.id,
          is_principal: m.codigo === payload.classificacoes.macroareaPrincipalCodigo
        }));
        const { error: macError } = await supabase
          .from('experiencia_macroarea')
          .insert(macRows);
        if (macError)
          throw new Error(`experiencia_macroarea: ${macError.message}`);
      }
    }

    // CNPq subáreas (lookup por código)
    if (
      payload.classificacoes.cnpqSubareaCodigos &&
      payload.classificacoes.cnpqSubareaCodigos.length > 0
    ) {
      const { data: subareas } = await supabase
        .from('subarea_cnpq')
        .select('id, codigo')
        .in('codigo', payload.classificacoes.cnpqSubareaCodigos);

      if (subareas && subareas.length > 0) {
        await supabase.from('experiencia_cnpq').insert(
          subareas.map((s, idx) => ({
            experiencia_id: experienciaId,
            subarea_id: s.id,
            is_principal: idx === 0
          }))
        );
      }
    }

    // ----- Inserir respostas fuzzy (20 linhas) -----
    const { data: perguntas } = await supabase
      .from('pergunta_fuzzy')
      .select('id, codigo');

    if (!perguntas) throw new Error('falha ao ler pergunta_fuzzy');

    const respostasFuzzy: Array<{
      experiencia_id: string;
      pergunta_id: string;
      valor: number;
    }> = [];

    for (const dim of DIMENSIONS) {
      const vals = payload.fuzzyAnswers[dim];
      for (let i = 0; i < 4; i++) {
        const codigo = `${dim}${i + 1}`;
        const pergunta = perguntas.find((p) => p.codigo === codigo);
        if (pergunta) {
          respostasFuzzy.push({
            experiencia_id: experienciaId,
            pergunta_id: pergunta.id,
            valor: vals[i]
          });
        }
      }
    }

    const { error: respError } = await supabase
      .from('resposta_fuzzy')
      .insert(respostasFuzzy);
    if (respError) throw new Error(`resposta_fuzzy: ${respError.message}`);

    // ----- Justificativas (opcional, max 1000 chars) -----
    const justifRows = DIMENSIONS.filter(
      (d) => payload.justificativas[d] && payload.justificativas[d]!.trim()
    ).map((d) => ({
      experiencia_id: experienciaId,
      dimensao: DIMENSION_DB_KEY[d],
      texto: payload.justificativas[d]!.slice(0, 1000)
    }));

    if (justifRows.length > 0) {
      const { error: justifError } = await supabase
        .from('justificativa_dimensao')
        .insert(justifRows);
      if (justifError)
        throw new Error(`justificativa_dimensao: ${justifError.message}`);
    }

    // ----- Avaliacao fuzzy (snapshot calculado) -----
    const { error: avalError } = await supabase.from('avaliacao_fuzzy').insert({
      experiencia_id: experienciaId,
      media_participacao: fuzzyResult.medias.P,
      media_impacto: fuzzyResult.medias.I,
      media_apropriacao: fuzzyResult.medias.A,
      media_sustentabilidade: fuzzyResult.medias.S,
      media_replicabilidade: fuzzyResult.medias.R,
      pertinencias: fuzzyResult.pertinencias,
      ativacoes_fuzzy: fuzzyResult.ativacoes,
      indice_fuzzy: fuzzyResult.indice_fuzzy,
      indice_linear: fuzzyResult.indice_linear,
      faixa: fuzzyResult.faixa,
      versao_motor: fuzzyResult.versao_motor
    });
    if (avalError) throw new Error(`avaliacao_fuzzy: ${avalError.message}`);

    // ----- Upload de imagens + insert anexo -----
    // Bucket público — leitura via URL direta. Caminho:
    //   <experienciaId>/<slot>-<timestamp>.<ext>
    // Falhas de upload de imagem cancelam todo o submit (cleanup no catch).
    const slots: AnexoSlot[] = ['capa', 'secundaria1', 'secundaria2'];
    for (const slot of slots) {
      const f = files[slot];
      if (!f) continue;

      const ext = extFromMime(f.type);
      const path = `${experienciaId}/${slot}-${Date.now()}.${ext}`;
      const bytes = new Uint8Array(await f.arrayBuffer());

      const { error: upErr } = await supabase.storage
        .from(ANEXO_BUCKET)
        .upload(path, bytes, {
          contentType: f.type,
          upsert: false
        });
      if (upErr) throw new Error(`upload ${slot}: ${upErr.message}`);
      uploadedPaths.push(path);

      const { data: urlData } = supabase.storage
        .from(ANEXO_BUCKET)
        .getPublicUrl(path);

      const tipo = SLOT_TO_TIPO[slot];
      const { error: anexoErr } = await supabase.from('anexo').insert({
        experiencia_id: experienciaId,
        tipo,
        origem: 'supabase_storage',
        bucket: ANEXO_BUCKET,
        caminho_storage: path,
        url_externa: urlData.publicUrl,
        titulo: f.name,
        tamanho_bytes: f.size,
        mime_type: f.type,
        ordem: slot === 'capa' ? 0 : slot === 'secundaria1' ? 1 : 2,
        is_capa: slot === 'capa'
      });
      if (anexoErr) throw new Error(`anexo ${slot}: ${anexoErr.message}`);
    }

    // ----- Submissao (snapshot JSONB completo) -----
    const protocolo = await generateProtocolo(supabase);

    const { error: submError } = await supabase
      .from('submissao_formulario')
      .insert({
        experiencia_id: experienciaId,
        protocolo,
        respostas_brutas: payload as unknown as Record<string, unknown>,
        triagem_resultado: fuzzyResult,
        versao_motor_fuzzy: fuzzyResult.versao_motor,
        ip_origem: payload.meta.ipOrigem || null,
        user_agent: payload.meta.userAgent || null
      });
    if (submError) throw new Error(`submissao_formulario: ${submError.message}`);

    // ----- Histórico de status inicial -----
    await supabase.from('historico_status').insert({
      experiencia_id: experienciaId,
      status_anterior: null,
      status_novo: status,
      motivo: 'Cadastro submetido pelo coordenador',
      alterado_por: 'sistema'
    });

    // ----- Disparar e-mails transacionais (síncrono, não bloqueia rollback) -----
    // Erros de e-mail são logados mas não cancelam o submit
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
    const adminDestino = process.env.EMAIL_ADMIN_DESTINO ?? '';

    const emailVarsCoord = {
      coordenador_nome: payload.identificacao.coordNome,
      coordenador_email: payload.identificacao.coordEmail,
      experiencia_titulo: payload.experiencia.titulo,
      protocolo
    };

    try {
      await sendEmail({
        tipo: 'confirmacao_submissao',
        destinatario: payload.identificacao.coordEmail,
        experienciaId,
        vars: emailVarsCoord
      });
    } catch (emailErr) {
      console.warn('[submitCadastro] falha ao enviar confirmacao_submissao:', emailErr);
    }

    if (adminDestino) {
      try {
        await sendEmail({
          tipo: 'notificacao_admin',
          destinatario: adminDestino,
          experienciaId,
          vars: {
            ...emailVarsCoord,
            admin_url: `${siteUrl}/admin-lisa-xyz/fila`
          }
        });
      } catch (emailErr) {
        console.warn('[submitCadastro] falha ao enviar notificacao_admin:', emailErr);
      }
    }

    return { success: true, protocolo, experienciaId };
  } catch (e) {
    // Cleanup: se experiencia foi criada mas algo falhou, deletar
    // (CASCADE remove children automaticamente)
    if (cleanupId) {
      console.error('[submitCadastro] erro, limpando experiencia:', cleanupId);
      await supabase.from('experiencia').delete().eq('id', cleanupId);
    }
    // Cleanup de arquivos uploadados (CASCADE não toca no Storage)
    if (uploadedPaths.length > 0) {
      console.error('[submitCadastro] removendo arquivos do storage:', uploadedPaths);
      await supabase.storage.from(ANEXO_BUCKET).remove(uploadedPaths);
    }

    const message = e instanceof Error ? e.message : 'erro desconhecido';
    console.error('[submitCadastro]', message);
    return { success: false, error: message };
  }
}

// =============================================================
// Helpers internos
// =============================================================

type SupabaseClient = ReturnType<typeof createServiceRoleClient>;

function generateSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 350);
}

function mapStatusExperiencia(
  s: CadastroPayload['experiencia']['statusExperiencia']
): ExperienciaStatus {
  // Toda submissão entra como em_moderacao — o status real fica registrado
  // em respostas_brutas. Ao aprovar, o admin escolhe o status final
  // (aprovada_ativa_em_andamento, aprovada_ativa_perene, etc).
  return 'em_moderacao';
}

function mapVinculo(v: string | undefined): string | null {
  if (!v) return null;
  const map: Record<string, string> = {
    Docente: 'docente',
    'Técnico-administrativo': 'tecnico_administrativo',
    'Estudante de graduação': 'estudante_graduacao',
    'Estudante de pós-graduação': 'estudante_pos',
    'Pesquisador externo': 'pesquisador_externo',
    'Membro da comunidade': 'membro_comunidade',
    'Representante de organização': 'representante_organizacao',
    Outro: 'outro'
  };
  return map[v] ?? null;
}

async function lookupId(
  supabase: SupabaseClient,
  table: string,
  field: string,
  value: string
): Promise<string | null> {
  const { data } = await supabase.from(table).select('id').eq(field, value).maybeSingle();
  return data?.id ?? null;
}

async function upsertPessoa(
  supabase: SupabaseClient,
  pessoa: {
    nome_completo: string;
    email: string;
    vinculo?: string | null;
    departamento?: string | null;
    lattes_url?: string | null;
    telefone?: string | null;
  }
): Promise<string> {
  // Tenta buscar por email primeiro
  const { data: existing } = await supabase
    .from('pessoa')
    .select('id')
    .eq('email', pessoa.email)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('pessoa')
    .insert(pessoa)
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`pessoa: ${error?.message ?? 'falha ao inserir'}`);
  }
  return data.id;
}

async function insertManyByCode(
  supabase: SupabaseClient,
  taxonomyTable: string,
  joinTable: string,
  joinFkColumn: string,
  experienciaId: string,
  codigos: string[]
): Promise<void> {
  if (!codigos || codigos.length === 0) return;

  const { data } = await supabase
    .from(taxonomyTable)
    .select('id, codigo')
    .in('codigo', codigos);

  if (!data || data.length === 0) return;

  const rows = data.map((row) => ({
    experiencia_id: experienciaId,
    [joinFkColumn]: row.id
  }));

  const { error } = await supabase.from(joinTable).insert(rows);
  if (error) throw new Error(`${joinTable}: ${error.message}`);
}

async function generateProtocolo(supabase: SupabaseClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `LISA-${year}-`;

  const { count } = await supabase
    .from('submissao_formulario')
    .select('protocolo', { count: 'exact', head: true })
    .like('protocolo', `${prefix}%`);

  const next = (count ?? 0) + 1;
  return `${prefix}${String(next).padStart(4, '0')}`;
}
