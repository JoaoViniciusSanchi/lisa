import { createBrowserSupabase } from '@/lib/supabase/client';

export interface ExpertInput {
  nome: string;
  email: string;
  instituicao?: string;
  lattes?: string;
  departamento?: string;
  ativo?: boolean;
  forproex_ids?: string[];
  cnpq_ids?: string[];
}

export interface PesquisadorExpert {
  id: string;
  nome: string;
  email: string;
  instituicao: string | null;
  lattes: string | null;
  departamento: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  expert_forproex: { area_tematica_forproex: { id: string; nome: string; codigo: string } }[];
  expert_cnpq: { grande_area_cnpq: { id: string; nome: string } }[];
}

export async function listExpertsAction(): Promise<PesquisadorExpert[]> {
  const sb = createBrowserSupabase();
  const { data } = await sb
    .from('pesquisador_expert')
    .select(`
      id, nome, email, instituicao, lattes, departamento, ativo, criado_em, atualizado_em,
      expert_forproex(area_tematica_forproex(id, nome, codigo)),
      expert_cnpq(grande_area_cnpq(id, nome))
    `)
    .order('nome');
  return (data ?? []) as unknown as PesquisadorExpert[];
}

export async function createExpertAction(input: ExpertInput): Promise<{ ok: boolean; error?: string }> {
  const sb = createBrowserSupabase();

  const { data: expert, error } = await sb
    .from('pesquisador_expert')
    .insert({
      nome: input.nome,
      email: input.email,
      instituicao: input.instituicao ?? null,
      lattes: input.lattes ?? null,
      departamento: input.departamento ?? null,
      ativo: input.ativo ?? true,
    })
    .select('id')
    .single();

  if (error || !expert) {
    return { ok: false, error: error?.message ?? 'Erro ao criar expert' };
  }

  if (input.forproex_ids?.length) {
    await sb.from('expert_forproex').insert(
      input.forproex_ids.map((id) => ({ expert_id: expert.id, area_tematica_forproex_id: id }))
    );
  }

  if (input.cnpq_ids?.length) {
    await sb.from('expert_cnpq').insert(
      input.cnpq_ids.map((id) => ({ expert_id: expert.id, grande_area_cnpq_id: id }))
    );
  }

  return { ok: true };
}

export async function updateExpertAction(id: string, input: Partial<ExpertInput>): Promise<{ ok: boolean }> {
  const sb = createBrowserSupabase();

  await sb.from('pesquisador_expert').update({
    ...(input.nome !== undefined && { nome: input.nome }),
    ...(input.email !== undefined && { email: input.email }),
    ...(input.instituicao !== undefined && { instituicao: input.instituicao }),
    ...(input.lattes !== undefined && { lattes: input.lattes }),
    ...(input.departamento !== undefined && { departamento: input.departamento }),
    ...(input.ativo !== undefined && { ativo: input.ativo }),
  }).eq('id', id);

  if (input.forproex_ids !== undefined) {
    await sb.from('expert_forproex').delete().eq('expert_id', id);
    if (input.forproex_ids.length) {
      await sb.from('expert_forproex').insert(
        input.forproex_ids.map((fid) => ({ expert_id: id, area_tematica_forproex_id: fid }))
      );
    }
  }

  if (input.cnpq_ids !== undefined) {
    await sb.from('expert_cnpq').delete().eq('expert_id', id);
    if (input.cnpq_ids.length) {
      await sb.from('expert_cnpq').insert(
        input.cnpq_ids.map((cid) => ({ expert_id: id, grande_area_cnpq_id: cid }))
      );
    }
  }

  return { ok: true };
}

export async function toggleExpertAtivoAction(id: string, ativo: boolean): Promise<{ ok: boolean }> {
  const sb = createBrowserSupabase();
  await sb.from('pesquisador_expert').update({ ativo }).eq('id', id);
  return { ok: true };
}

export async function getForproexAreasAction() {
  const sb = createBrowserSupabase();
  const { data } = await sb.from('area_tematica_forproex').select('id, nome, codigo').order('ordem');
  return data ?? [];
}

export async function getGrandesAreasCnpqAction() {
  const sb = createBrowserSupabase();
  const { data } = await sb.from('grande_area_cnpq').select('id, nome').order('ordem');
  return data ?? [];
}
