import { createBrowserSupabase } from '@/lib/supabase/client';

// ─── Helpers ─────────────────────────────────────────────────

async function getCurrentAdminId(): Promise<string> {
  const sb = createBrowserSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { data } = await sb
    .from('admin_perfil')
    .select('id')
    .eq('id', user.id)
    .eq('ativo', true)
    .single();
  if (!data) throw new Error('admin_perfil não encontrado para este usuário');
  return data.id;
}

async function logAction(
  adminId: string,
  acao: string,
  experienciaId?: string,
  detalhes?: Record<string, unknown>
) {
  const sb = createBrowserSupabase();
  await sb.from('log_moderacao').insert({
    admin_id: adminId,
    acao,
    experiencia_id: experienciaId ?? null,
    detalhes: detalhes ?? null
  });
}

async function insertHistoricoStatus(
  sb: ReturnType<typeof createBrowserSupabase>,
  experienciaId: string,
  statusAnterior: string,
  statusNovo: string,
  motivo: string,
  adminId: string
) {
  await sb.from('historico_status').insert({
    experiencia_id: experienciaId,
    status_anterior: statusAnterior,
    status_novo: statusNovo,
    motivo,
    alterado_por: adminId
  });
}

// ─── Moderação ───────────────────────────────────────────────

export async function approveExperiencia(
  experienciaId: string,
  isPerene: boolean,
  motivo: string
) {
  const adminId = await getCurrentAdminId();
  const sb = createBrowserSupabase();

  const novoStatus = isPerene
    ? 'aprovada_ativa_perene'
    : 'aprovada_ativa_em_andamento';

  const { data: atual } = await sb
    .from('experiencia')
    .select('status')
    .eq('id', experienciaId)
    .single();

  await sb
    .from('experiencia')
    .update({ status: novoStatus, aprovada_em: new Date().toISOString() })
    .eq('id', experienciaId);

  await insertHistoricoStatus(sb, experienciaId, atual?.status, novoStatus, motivo, adminId);
  await logAction(adminId, 'aprovou_experiencia', experienciaId, { motivo, novo_status: novoStatus });

  return { ok: true };
}

export async function rejectExperiencia(experienciaId: string, motivo: string) {
  const adminId = await getCurrentAdminId();
  const sb = createBrowserSupabase();

  const { data: atual } = await sb
    .from('experiencia')
    .select('status, email_contato')
    .eq('id', experienciaId)
    .single();

  await sb
    .from('experiencia')
    .update({ status: 'rejeitada' })
    .eq('id', experienciaId);

  await insertHistoricoStatus(sb, experienciaId, atual?.status, 'rejeitada', motivo, adminId);
  await logAction(adminId, 'rejeitou_experiencia', experienciaId, { motivo });

  // Registrar e-mail de rejeição na fila
  if (atual?.email_contato) {
    await sb.from('disparo_email').insert({
      experiencia_id: experienciaId,
      tipo: 'rejeicao',
      destinatario: atual.email_contato,
      status: 'pendente'
    });
  }

  return { ok: true };
}

export async function updateIsInternaAction(experienciaId: string, isInterna: boolean) {
  const adminId = await getCurrentAdminId();
  const sb = createBrowserSupabase();

  await sb.from('experiencia').update({ is_interna: isInterna }).eq('id', experienciaId);
  await logAction(adminId, 'editou_experiencia', experienciaId, { campo: 'is_interna', valor: isInterna });

  return { ok: true };
}

// ─── Traduções ───────────────────────────────────────────────

export async function updateTraducaoStatus(
  traducaoId: string,
  novoStatus: string
) {
  const adminId = await getCurrentAdminId();
  const sb = createBrowserSupabase();

  const updateData: Record<string, unknown> = { status_global: novoStatus, atualizada_em: new Date().toISOString() };

  if (novoStatus === 'primeira_revisao_concluida') {
    updateData.primeira_revisao_em = new Date().toISOString();
    updateData.primeira_revisao_por_id = adminId;
  }
  if (novoStatus === 'publicavel') {
    updateData.segunda_revisao_em = new Date().toISOString();
    updateData.segunda_revisao_por_id = adminId;
  }
  if (novoStatus === 'publicada') {
    updateData.publicada_em = new Date().toISOString();
  }

  await sb.from('experiencia_traducao').update(updateData).eq('id', traducaoId);
  await logAction(adminId, 'aprovou_traducao_primeira_revisao', undefined, { traducao_id: traducaoId, novo_status: novoStatus });

  return { ok: true };
}

export async function saveTraducaoContent(
  traducaoId: string,
  fields: { historico?: string; metodologia?: string; resultados_impactos?: string; desafios_perspectivas?: string }
) {
  const adminId = await getCurrentAdminId();
  const sb = createBrowserSupabase();

  await sb.from('experiencia_traducao')
    .update({ ...fields, atualizada_em: new Date().toISOString() })
    .eq('id', traducaoId);

  await logAction(adminId, 'editou_conteudo_en', undefined, { traducao_id: traducaoId });
  return { ok: true };
}

export async function triggerDeepLTranslation(experienciaId: string) {
  const adminId = await getCurrentAdminId();
  const sb = createBrowserSupabase();

  // Marca como pendente de API — Edge Function fará o trabalho
  const { data: trad } = await sb
    .from('experiencia_traducao')
    .upsert({ experiencia_id: experienciaId, idioma: 'en', titulo: '', status_global: 'pendente' }, { onConflict: 'experiencia_id,idioma' })
    .select('id')
    .single();

  if (trad) {
    await sb.from('experiencia_traducao')
      .update({ status_global: 'pendente', provedor_api: 'deepl' })
      .eq('id', trad.id);
  }

  await logAction(adminId, 'regenerou_traducao_api', experienciaId);
  return { ok: true };
}

// ─── Config ──────────────────────────────────────────────────

export async function saveConfigValue(chave: string, valor: unknown) {
  const adminId = await getCurrentAdminId();
  const sb = createBrowserSupabase();

  await sb.from('configuracao_sistema').update({
    valor: valor as never,
    atualizado_em: new Date().toISOString(),
    atualizado_por_id: adminId
  }).eq('chave', chave);

  await logAction(adminId, 'alterou_categorizacao', undefined, { chave, valor });
  return { ok: true };
}

// ─── Leitura para client components ──────────────────────────
// Funções de leitura expostas como Server Actions para que client components
// possam chamá-las sem importar módulos server-only diretamente.

export async function getExperienciaDetailsAction(id: string) {
  const sb = createBrowserSupabase();
  const [{ data: exp }, { data: avaliacao }, { data: respostas }, { data: pessoas }, { data: anexos }, { data: traducaoPt }, { data: justificativas }] =
    await Promise.all([
      sb.from('experiencia').select(`
        *, categoria_editorial(nome),
        experiencia_forproex(principal, area_tematica_forproex(nome, codigo)),
        experiencia_cnpq(is_principal, subarea_cnpq(nome, grande_area_cnpq(nome))),
        experiencia_ods(ods_id, is_principal, ods(nome, cor_hex)),
        experiencia_finalidade_social(principal, finalidade_social(nome)),
        experiencia_conteudo(versao_atual, notas_editoriais, instagram, facebook, youtube, site_externo)
      `).eq('id', id).single(),
      sb.from('avaliacao_fuzzy')
        .select('*')
        .eq('experiencia_id', id)
        .order('calculada_em', { ascending: false })
        .limit(1)
        .single(),
      sb.from('resposta_fuzzy')
        .select('valor, pergunta_fuzzy(codigo, dimensao, texto_pergunta, ordem)')
        .eq('experiencia_id', id),
      sb.from('experiencia_pessoa').select('papel, ordem, pessoa(nome_completo, email, vinculo, lattes_url)').eq('experiencia_id', id).order('ordem'),
      sb.from('anexo').select('tipo, origem, url_externa, caminho_storage, titulo, is_capa').eq('experiencia_id', id),
      sb.from('experiencia_traducao').select('titulo, historico, metodologia, resultados_impactos, desafios_perspectivas, status_global, status_por_campo').eq('experiencia_id', id).eq('idioma', 'pt').single(),
      sb.from('justificativa_dimensao').select('dimensao, texto').eq('experiencia_id', id)
    ]);
  return { exp, avaliacao, respostas: respostas ?? [], pessoas: pessoas ?? [], anexos: anexos ?? [], traducaoPt, justificativas: justificativas ?? [] };
}

export async function getTraducaoDetalheAction(traducaoId: string) {
  const sb = createBrowserSupabase();
  const { data } = await sb
    .from('experiencia_traducao')
    .select(`
      *,
      experiencia(titulo, id,
        experiencia_traducao(idioma, titulo, historico, metodologia, resultados_impactos, desafios_perspectivas)
      )
    `)
    .eq('id', traducaoId)
    .single();
  return data;
}
