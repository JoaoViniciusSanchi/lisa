import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const payloadRaw = formData.get('payload');

    if (typeof payloadRaw !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Payload ausente ou inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(payloadRaw);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Payload mal-formado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validações
    if (!payload.termoAceito) {
      return new Response(
        JSON.stringify({ success: false, error: 'Termo de consentimento não aceito' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      return new Response(
        JSON.stringify({
          success: false,
          error: `Campos obrigatórios não preenchidos: ${camposFaltantes.join(', ')}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Coleta arquivos
    const files: Partial<Record<AnexoSlot, Uint8Array>> = {};
    const fileMetadata: Partial<Record<AnexoSlot, { type: string; name: string; size: number }>> = {};

    for (const slot of ['capa', 'secundaria1', 'secundaria2'] as AnexoSlot[]) {
      const f = formData.get(slot);
      if (f instanceof File && f.size > 0) {
        if (!ALLOWED_MIME.includes(f.type)) {
          return new Response(
            JSON.stringify({
              success: false,
              error: `Arquivo ${slot} tem formato não suportado (${f.type})`
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (f.size > MAX_SIZE_BYTES) {
          return new Response(
            JSON.stringify({
              success: false,
              error: `Arquivo ${slot} excede 5MB`
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        files[slot] = new Uint8Array(await f.arrayBuffer());
        fileMetadata[slot] = { type: f.type, name: f.name, size: f.size };
      }
    }

    const slug = generateSlug(payload.experiencia.titulo);

    // Validação fuzzy (recalcula no servidor)
    // Para simplificar, apenas verifica se não é muito baixo
    const fuzzyIndex = payload.fuzzyAnswers ? calculateSimpleFuzzy(payload.fuzzyAnswers) : 0;
    const gateTriagemMin = 30;
    if (fuzzyIndex < gateTriagemMin) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Triagem não atende parâmetros mínimos do LISA'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let cleanupId: string | null = null;
    const uploadedPaths: string[] = [];

    try {
      // Inserir experiencia
      const { data: expData, error: expError } = await supabase
        .from('experiencia')
        .insert({
          titulo: payload.experiencia.titulo,
          slug,
          resumo: payload.experiencia.historico.slice(0, 280),
          data_inicio: payload.experiencia.dataInicio || null,
          data_fim: payload.experiencia.dataFim || null,
          is_perene: payload.experiencia.statusExperiencia === 'perene',
          status: 'em_moderacao',
          campus_uff: payload.experiencia.campus || null,
          municipio: payload.experiencia.municipio || null,
          uf: payload.experiencia.uf || null,
          indice_fuzzy: fuzzyIndex,
          faixa_fuzzy_atual: 'amarelo',
          score_calculado_em: new Date().toISOString(),
          email_contato: payload.identificacao.coordEmail
        })
        .select('id')
        .single();

      if (expError || !expData) {
        throw new Error(`experiencia: ${expError?.message ?? 'falha ao inserir'}`);
      }

      const experienciaId = expData.id;
      cleanupId = experienciaId;

      // Inserir traducao
      await supabase
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

      // Inserir conteudo
      await supabase
        .from('experiencia_conteudo')
        .insert({
          experiencia_id: experienciaId,
          email_contato_publico: payload.identificacao.coordEmail,
          instagram: payload.materiais.instagram || null,
          facebook: payload.materiais.facebook || null,
          youtube: payload.materiais.youtube || null,
          site_externo: payload.materiais.siteExterno || null,
          versao_atual: 'bruto',
          texto_bruto_snapshot: payload.materiais
        });

      // Inserir pessoa coordenador
      const { data: pessoaData } = await supabase
        .from('pessoa')
        .insert({
          nome_completo: payload.identificacao.coordNome,
          email: payload.identificacao.coordEmail,
          departamento: payload.identificacao.coordDepartamento || null,
          lattes_url: payload.identificacao.coordLattes || null,
          telefone: payload.identificacao.coordTelefone || null
        })
        .select('id')
        .single();

      if (pessoaData) {
        await supabase.from('experiencia_pessoa').insert({
          experiencia_id: experienciaId,
          pessoa_id: pessoaData.id,
          papel: 'coordenador',
          ordem: 0
        });
      }

      // Upload imagens
      for (const slot of ['capa', 'secundaria1', 'secundaria2'] as AnexoSlot[]) {
        const fileBytes = files[slot];
        if (!fileBytes) continue;

        const metadata = fileMetadata[slot];
        const ext = extFromMime(metadata!.type);
        const path = `${experienciaId}/${slot}-${Date.now()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(ANEXO_BUCKET)
          .upload(path, fileBytes, {
            contentType: metadata!.type,
            upsert: false
          });

        if (upErr) throw new Error(`upload ${slot}: ${upErr.message}`);
        uploadedPaths.push(path);

        const { data: urlData } = supabase.storage
          .from(ANEXO_BUCKET)
          .getPublicUrl(path);

        const tipo = SLOT_TO_TIPO[slot];
        await supabase.from('anexo').insert({
          experiencia_id: experienciaId,
          tipo,
          origem: 'supabase_storage',
          bucket: ANEXO_BUCKET,
          caminho_storage: path,
          url_externa: urlData.publicUrl,
          titulo: metadata!.name,
          tamanho_bytes: metadata!.size,
          mime_type: metadata!.type,
          ordem: slot === 'capa' ? 0 : slot === 'secundaria1' ? 1 : 2,
          is_capa: slot === 'capa'
        });
      }

      // Gerar protocolo
      const year = new Date().getFullYear();
      const prefix = `LISA-${year}-`;
      const { count } = await supabase
        .from('submissao_formulario')
        .select('protocolo', { count: 'exact', head: true })
        .like('protocolo', `${prefix}%`);

      const next = (count ?? 0) + 1;
      const protocolo = `${prefix}${String(next).padStart(4, '0')}`;

      // Inserir submissao
      await supabase
        .from('submissao_formulario')
        .insert({
          experiencia_id: experienciaId,
          protocolo,
          respostas_brutas: payload,
          triagem_resultado: { fuzzy_index: fuzzyIndex },
          versao_motor_fuzzy: '1.0',
          ip_origem: payload.meta?.ipOrigem || null,
          user_agent: payload.meta?.userAgent || null
        });

      // Historico
      await supabase.from('historico_status').insert({
        experiencia_id: experienciaId,
        status_anterior: null,
        status_novo: 'em_moderacao',
        motivo: 'Cadastro submetido pelo coordenador',
        alterado_por: 'sistema'
      });

      return new Response(
        JSON.stringify({ success: true, protocolo, experienciaId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (e) {
      if (cleanupId) {
        await supabase.from('experiencia').delete().eq('id', cleanupId);
      }
      if (uploadedPaths.length > 0) {
        await supabase.storage.from(ANEXO_BUCKET).remove(uploadedPaths);
      }

      const message = e instanceof Error ? e.message : 'erro desconhecido';
      console.error('[submit-cadastro]', message);
      return new Response(
        JSON.stringify({ success: false, error: message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'erro desconhecido';
    console.error('[submit-cadastro]', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 350);
}

function calculateSimpleFuzzy(answers: any): number {
  // Simplified fuzzy calculation for edge function
  // In production, import the actual fuzzy logic
  if (!answers) return 0;
  const dims = Object.values(answers) as number[][];
  const allAnswers = dims.flat();
  const avg = allAnswers.reduce((a, b) => a + b, 0) / allAnswers.length;
  return avg * 100;
}
