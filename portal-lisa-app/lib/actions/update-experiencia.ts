'use server';

import { createServiceRoleClient } from '@/lib/supabase/server';
import type { IdentificacaoData, ExperienciaData, ResultadosData, MateriaisData, ExperienciaENData } from '@/components/cadastro/state';

export interface UpdatePayload {
  identificacao: IdentificacaoData;
  experiencia: ExperienciaData;
  resultados: ResultadosData;
  materiais: MateriaisData;
  experienciaEN: ExperienciaENData;
}

export async function updateExperienciaFromToken(
  token: string,
  payload: UpdatePayload
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServiceRoleClient();

  // 1. Validar convite
  const { data: convite } = await supabase
    .from('convite_atualizacao')
    .select('id, experiencia_id, pessoa_id, tipo, expira_em, respondido_em')
    .eq('token', token)
    .maybeSingle();

  if (!convite || convite.respondido_em || new Date(convite.expira_em) < new Date()) {
    return { ok: false, error: 'Token inválido ou expirado' };
  }

  const experienciaId = convite.experiencia_id as string;

  try {
    // 2. Atualizar dados da experiência (PT)
    await supabase.from('experiencia').update({
      titulo: payload.experiencia.titulo,
      data_inicio: payload.experiencia.dataInicio
        ? `${payload.experiencia.dataInicio}-01`
        : null,
      is_perene: payload.experiencia.statusExperiencia === 'perene',
      campus_uff: payload.experiencia.campus || null,
      municipio: payload.experiencia.municipio || null,
      uf: payload.experiencia.uf || null
    }).eq('id', experienciaId);

    // 3. Atualizar tradução PT
    await supabase.from('experiencia_traducao').update({
      titulo: payload.experiencia.titulo,
      historico: payload.experiencia.historico,
      metodologia: payload.experiencia.metodologia,
      resultados_impactos: payload.resultados.resultadosImpactos,
      desafios_perspectivas: payload.resultados.desafiosPerspectivas,
      atualizada_em: new Date().toISOString()
    }).eq('experiencia_id', experienciaId).eq('idioma', 'pt');

    // 4. Atualizar / inserir tradução EN (se tiver conteúdo)
    const enTemConteudo = Boolean(
      payload.experienciaEN.titulo ||
      payload.experienciaEN.historico ||
      payload.experienciaEN.metodologia
    );

    if (enTemConteudo) {
      await supabase.from('experiencia_traducao').upsert({
        experiencia_id: experienciaId,
        idioma: 'en',
        titulo: payload.experienciaEN.titulo,
        historico: payload.experienciaEN.historico,
        metodologia: payload.experienciaEN.metodologia,
        resultados_impactos: payload.experienciaEN.resultadosImpactos,
        desafios_perspectivas: payload.experienciaEN.desafiosPerspectivas,
        atualizada_em: new Date().toISOString()
      }, { onConflict: 'experiencia_id,idioma' });
    }

    // 5. Atualizar conteúdo (redes sociais)
    await supabase.from('experiencia_conteudo').update({
      instagram: payload.materiais.instagram || null,
      facebook: payload.materiais.facebook || null,
      youtube: payload.materiais.youtube || null,
      site_externo: payload.materiais.siteExterno || null
    }).eq('experiencia_id', experienciaId);

    // 6. Atualizar pessoa (coordenador) se mudou
    const { data: epData } = await supabase
      .from('experiencia_pessoa')
      .select('pessoa_id')
      .eq('experiencia_id', experienciaId)
      .eq('papel', 'coordenador')
      .maybeSingle();

    if (epData?.pessoa_id) {
      await supabase.from('pessoa').update({
        nome_completo: payload.identificacao.coordNome,
        vinculo: payload.identificacao.coordVinculo || null,
        departamento: payload.identificacao.coordDepartamento || null,
        lattes_url: payload.identificacao.coordLattes || null,
        telefone: payload.identificacao.coordTelefone || null
      }).eq('id', epData.pessoa_id);
    }

    // 7. Marcar convite como respondido
    const tipoConvite = convite.tipo as string;
    const resposta = tipoConvite === 'validacao_traducao'
      ? 'solicitou_edicao_traducao'
      : 'ainda_ativa_com_atualizacoes';

    await supabase.from('convite_atualizacao').update({
      respondido_em: new Date().toISOString(),
      resposta
    }).eq('id', convite.id);

    // 8. Registrar no historico_status (coordenador não tem admin_id)
    const editouEN = enTemConteudo;
    const motivoLog = editouEN
      ? 'Coordenador editou conteúdo via link mágico (PT + EN)'
      : 'Coordenador editou conteúdo via link mágico (PT)';

    await supabase.from('historico_status').insert({
      experiencia_id: experienciaId,
      status_anterior: null,
      status_novo: null,
      motivo: motivoLog,
      alterado_por: `coordenador_token:${token.slice(0, 8)}…`
    });

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'erro desconhecido';
    console.error('[updateExperienciaFromToken]', msg);
    return { ok: false, error: msg };
  }
}
