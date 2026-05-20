'use server';

import { createServiceRoleClient } from '@/lib/supabase/server';

export interface CadastroPesquisadorInput {
  nome: string;
  email: string;
  instituicao?: string;
  lattes?: string;
  departamento?: string;
  forproex_ids?: string[];
}

export async function cadastrarPesquisadorPublicoAction(
  input: CadastroPesquisadorInput
): Promise<{ ok: boolean; error?: string }> {
  if (!input.nome?.trim() || !input.email?.trim()) {
    return { ok: false, error: 'Nome e e-mail são obrigatórios.' };
  }

  const sb = createServiceRoleClient();

  const { data: expert, error } = await sb
    .from('pesquisador_expert')
    .insert({
      nome: input.nome.trim(),
      email: input.email.trim().toLowerCase(),
      instituicao: input.instituicao?.trim() || null,
      lattes: input.lattes?.trim() || null,
      departamento: input.departamento?.trim() || null,
      ativo: false, // aguarda ativação pelo admin
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'Este e-mail já está cadastrado.' };
    }
    return { ok: false, error: 'Erro ao registrar. Tente novamente.' };
  }

  if (input.forproex_ids?.length && expert) {
    await sb.from('expert_forproex').insert(
      input.forproex_ids.map((id) => ({ expert_id: expert.id, area_tematica_forproex_id: id }))
    );
  }

  return { ok: true };
}
