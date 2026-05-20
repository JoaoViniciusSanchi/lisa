import { createBrowserSupabase } from '@/lib/supabase/client';

// ─── Dashboard ────────────────────────────────────────────────

export async function getDashboardStats() {
  const sb = createBrowserSupabase();
  const { data } = await sb
    .from('view_estatisticas_dashboard')
    .select('*')
    .single();
  return data ?? {};
}

export async function getExperienciasByFinalidade() {
  const sb = createBrowserSupabase();
  const { data } = await sb
    .from('experiencia_finalidade_social')
    .select('finalidade_id, finalidade_social(nome)');
  if (!data) return [];
  const counts: Record<string, { nome: string; count: number }> = {};
  for (const row of data) {
    const id = row.finalidade_id as string;
    const fs = row.finalidade_social as unknown as { nome: string } | null;
    const nome = fs?.nome ?? id;
    if (!counts[id]) counts[id] = { nome, count: 0 };
    counts[id].count++;
  }
  return Object.values(counts).sort((a, b) => b.count - a.count);
}

export async function getExperienciasByCnpq() {
  const sb = createBrowserSupabase();
  const { data } = await sb
    .from('experiencia_cnpq')
    .select('subarea_cnpq(grande_area_cnpq(nome))');
  if (!data) return [];
  const counts: Record<string, { nome: string; count: number }> = {};
  for (const row of data) {
    const sc = row.subarea_cnpq as unknown as { grande_area_cnpq: { nome: string } } | null;
    const ga = sc?.grande_area_cnpq;
    if (!ga) continue;
    if (!counts[ga.nome]) counts[ga.nome] = { nome: ga.nome, count: 0 };
    counts[ga.nome].count++;
  }
  return Object.values(counts).sort((a, b) => b.count - a.count);
}

export async function getExperienciasByForproex() {
  const sb = createBrowserSupabase();
  const { data } = await sb
    .from('experiencia_forproex')
    .select('forproex_id, area_tematica_forproex(nome, codigo)');
  if (!data) return [];
  const counts: Record<string, { nome: string; codigo: string; count: number }> = {};
  for (const row of data) {
    const id = row.forproex_id as string;
    const area = row.area_tematica_forproex as unknown as { nome: string; codigo: string } | null;
    if (!area) continue;
    if (!counts[id]) counts[id] = { nome: area.nome, codigo: area.codigo, count: 0 };
    counts[id].count++;
  }
  return Object.values(counts).sort((a, b) => b.count - a.count);
}

export async function getExperienciasByStatus() {
  const sb = createBrowserSupabase();
  const { data } = await sb.from('experiencia').select('status');
  if (!data) return [];
  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

export async function getOdsUnderrepresented() {
  const sb = createBrowserSupabase();
  const [{ data: odsAll }, { data: links }] = await Promise.all([
    sb.from('ods').select('id, nome'),
    sb.from('experiencia_ods').select('ods_id')
  ]);
  if (!odsAll) return [];
  const countMap: Record<number, number> = {};
  for (const link of links ?? []) {
    countMap[link.ods_id] = (countMap[link.ods_id] ?? 0) + 1;
  }
  return odsAll
    .map((o) => ({ id: o.id, nome: o.nome, count: countMap[o.id] ?? 0 }))
    .filter((o) => o.count < 3)
    .sort((a, b) => a.count - b.count);
}

export async function getCrossTableData() {
  const sb = createBrowserSupabase();
  const [{ data: experiencias }, { data: finalidades }, { data: links }] = await Promise.all([
    sb.from('experiencia').select('id, status'),
    sb.from('finalidade_social').select('id, nome').order('ordem'),
    sb.from('experiencia_finalidade_social').select('experiencia_id, finalidade_id')
  ]);
  if (!experiencias || !finalidades || !links) return { finalidades: [], matrix: {} };

  // expId → status
  const statusMap: Record<string, string> = {};
  for (const e of experiencias) statusMap[e.id] = e.status;

  // {finalidade_id: {status: count}}
  const matrix: Record<string, Record<string, number>> = {};
  for (const link of links) {
    const fid = link.finalidade_id;
    const status = statusMap[link.experiencia_id];
    if (!status) continue;
    if (!matrix[fid]) matrix[fid] = {};
    matrix[fid][status] = (matrix[fid][status] ?? 0) + 1;
  }

  return {
    finalidades: finalidades.map((f) => ({ id: f.id, nome: f.nome })),
    matrix
  };
}

export async function getRecentActivity(limit = 10) {
  const sb = createBrowserSupabase();
  const { data } = await sb
    .from('log_moderacao')
    .select('id, acao, ocorrido_em, detalhes, experiencia_id, experiencia(titulo), admin_perfil(nome_completo)')
    .order('ocorrido_em', { ascending: false })
    .limit(limit);
  return data ?? [];
}

// ─── Fila de moderação ───────────────────────────────────────

export type FilaFilters = {
  status?: string;
  faixa?: string;
  campus?: string;
  finalidade_id?: string;
  grande_area_id?: string;
  forproex_id?: string;
  ods_id?: string;
  orderBy?: 'fuzzy_desc' | 'data_asc' | 'titulo_asc';
};

export async function getFilaModeracaoFull(filters: FilaFilters = {}) {
  const sb = createBrowserSupabase();

  let query = sb.from('experiencia').select(`
    id, titulo, slug, submetida_em, email_contato,
    campus_uff, municipio, status, faixa_fuzzy_atual, indice_fuzzy, is_interna,
    categoria_editorial(nome),
    experiencia_forproex(principal, area_tematica_forproex(nome, codigo)),
    experiencia_cnpq(is_principal, subarea_cnpq(nome, grande_area_cnpq(nome))),
    experiencia_ods(ods_id, is_principal),
    experiencia_finalidade_social(principal, finalidade_social(nome))
  `);

  // Filtros
  if (filters.status) {
    query = query.eq('status', filters.status);
  } else {
    // padrão: mostrar fila de moderação
    query = query.eq('status', 'em_moderacao');
  }
  if (filters.faixa) query = query.eq('faixa_fuzzy_atual', filters.faixa);
  if (filters.campus) query = query.eq('campus_uff', filters.campus);

  // Ordenação
  if (filters.orderBy === 'data_asc') {
    query = query.order('submetida_em', { ascending: true });
  } else if (filters.orderBy === 'titulo_asc') {
    query = query.order('titulo', { ascending: true });
  } else {
    // default: fuzzy desc
    query = query.order('indice_fuzzy', { ascending: false, nullsFirst: false });
  }

  const { data } = await query;
  let result = data ?? [];

  // Filtros pós-query (relações N:N — mais simples filtrar em JS para o MVP)
  if (filters.finalidade_id) {
    result = result.filter((e) =>
      ((e as unknown as { experiencia_finalidade_social: { finalidade_id: string }[] })
        .experiencia_finalidade_social ?? []
      ).some((f) => f.finalidade_id === filters.finalidade_id)
    );
  }

  return result;
}

export async function getExperienciaDetails(id: string) {
  const sb = createBrowserSupabase();
  const [{ data: exp }, { data: avaliacao }, { data: respostas }, { data: pessoas }, { data: anexos }, { data: traducaoPt }] =
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
      sb.from('experiencia_traducao').select('titulo, historico, metodologia, resultados_impactos, desafios_perspectivas, status_global, status_por_campo').eq('experiencia_id', id).eq('idioma', 'pt').single()
    ]);

  return { exp, avaliacao, respostas: respostas ?? [], pessoas: pessoas ?? [], anexos: anexos ?? [], traducaoPt };
}

export async function getFilaFilterOptions() {
  const sb = createBrowserSupabase();
  const [{ data: campi }, { data: finalidades }, { data: grandesAreas }, { data: forproex }] = await Promise.all([
    sb.from('experiencia').select('campus_uff').not('campus_uff', 'is', null),
    sb.from('finalidade_social').select('id, nome').order('ordem'),
    sb.from('grande_area_cnpq').select('id, nome').order('ordem'),
    sb.from('area_tematica_forproex').select('id, nome, codigo').order('ordem')
  ]);
  const campiUniq = [...new Set((campi ?? []).map((c) => c.campus_uff).filter(Boolean))].sort();
  return { campi: campiUniq, finalidades: finalidades ?? [], grandesAreas: grandesAreas ?? [], forproex: forproex ?? [] };
}

// ─── Traduções ───────────────────────────────────────────────

export async function getTraducoesPendentes() {
  const sb = createBrowserSupabase();
  const { data } = await sb
    .from('view_traducoes_pendentes')
    .select('*');
  return data ?? [];
}

export async function getTraducaoDetalhe(traducaoId: string) {
  const sb = createBrowserSupabase();
  const { data } = await sb
    .from('experiencia_traducao')
    .select(`
      *,
      experiencia(titulo, id,
        experiencia_traducao!inner(idioma, titulo, historico, metodologia, resultados_impactos, desafios_perspectivas)
      )
    `)
    .eq('id', traducaoId)
    .single();
  return data;
}

// ─── Config ──────────────────────────────────────────────────

export async function getConfigAll() {
  const sb = createBrowserSupabase();
  const { data } = await sb
    .from('configuracao_sistema')
    .select('*')
    .eq('editavel_pelo_painel', true)
    .order('categoria');
  return data ?? [];
}
