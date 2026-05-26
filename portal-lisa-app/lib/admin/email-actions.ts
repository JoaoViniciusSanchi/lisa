'use server';
// Server Actions de e-mail — separadas de actions.ts para evitar
// importação de módulos server-only em Client Components.
// Client Components podem importar Server Actions com 'use server'.

import { createServiceRoleClient } from '@/lib/supabase/server';
import { createAdminSessionClient } from '@/lib/supabase/admin-server';
import { sendEmail } from '@/lib/email/send';
import { getResendClient } from '@/lib/email/client';
import { FAKE_VARS } from '@/lib/email/defaults';

// ─── Reenvio manual (histórico) ──────────────────────────────

export async function reenviarEmail(disparoId: string) {
  const supabase = createServiceRoleClient();

  const { data: disparo } = await supabase
    .from('disparo_email')
    .select('*')
    .eq('id', disparoId)
    .single();

  if (!disparo) throw new Error('Disparo não encontrado');

  const fromAddress = process.env.EMAIL_FROM_ADDRESS ?? 'LISA <nao-responda@agir.uff.br>';
  let resendId: string | undefined;
  let erroMensagem: string | undefined;
  let statusEmail: 'enviado' | 'falhou' = 'enviado';

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: disparo.destinatario,
      subject: disparo.assunto ?? '(sem assunto)',
      html: disparo.corpo_html ?? ''
    });
    if (error) {
      erroMensagem = error.message;
      statusEmail = 'falhou';
    } else {
      resendId = data?.id;
    }
  } catch (e) {
    erroMensagem = e instanceof Error ? e.message : 'erro ao reenviar';
    statusEmail = 'falhou';
  }

  await supabase.from('disparo_email').insert({
    experiencia_id: disparo.experiencia_id,
    pessoa_id: disparo.pessoa_id,
    tipo: disparo.tipo,
    destinatario: disparo.destinatario,
    assunto: disparo.assunto,
    corpo_html: disparo.corpo_html,
    status: statusEmail,
    enviado_em: statusEmail === 'enviado' ? new Date().toISOString() : null,
    resend_id: resendId ?? null,
    erro_mensagem: erroMensagem ?? null
  });

  return { ok: statusEmail === 'enviado', error: erroMensagem };
}

// ─── Teste de template ────────────────────────────────────────

export async function sendTestEmail(tipo: string) {
  // Usa client de sessão para pegar o e-mail do admin logado
  const sessionClient = await createAdminSessionClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user?.email) throw new Error('Usuário sem e-mail');

  const supabase = createServiceRoleClient();
  const { data: perfil } = await supabase
    .from('admin_perfil')
    .select('nome')
    .eq('id', user.id)
    .maybeSingle();

  const vars = {
    ...FAKE_VARS,
    coordenador_nome: (perfil?.nome as string | undefined) ?? user.email
  };

  const result = await sendEmail({
    tipo,
    destinatario: user.email,
    vars
  });

  return result;
}

// ─── Validação de tradução ─────────────────────────────────────

export async function enviarValidacaoTraducao(experienciaId: string) {
  const supabase = createServiceRoleClient();
  const sessionClient = await createAdminSessionClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { data: exp } = await supabase
    .from('experiencia')
    .select('titulo')
    .eq('id', experienciaId)
    .single();

  // Busca coordenador
  const { data: epData } = await supabase
    .from('experiencia_pessoa')
    .select('pessoa(id, nome_completo, email)')
    .eq('experiencia_id', experienciaId)
    .eq('papel', 'coordenador')
    .limit(1)
    .maybeSingle();

  const pessoa = (epData?.pessoa as unknown) as { id: string; nome_completo: string; email: string } | null;
  if (!pessoa || !exp) throw new Error('Experiência ou coordenador não encontrado');

  const { data: configDias } = await supabase
    .from('configuracao_sistema')
    .select('valor')
    .eq('chave', 'convite_atualizacao_dias_validade')
    .maybeSingle();
  const diasValidade = Number(configDias?.valor ?? 30);

  const token = generateToken();
  const expiraEm = new Date(Date.now() + diasValidade * 24 * 60 * 60 * 1000).toISOString();

  await supabase.from('convite_atualizacao').insert({
    experiencia_id: experienciaId,
    pessoa_id: pessoa.id,
    token,
    expira_em: expiraEm,
    tipo: 'validacao_traducao'
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  await sendEmail({
    tipo: 'validacao_traducao',
    destinatario: pessoa.email,
    experienciaId,
    pessoaId: pessoa.id,
    vars: {
      coordenador_nome: pessoa.nome_completo,
      experiencia_titulo: exp.titulo,
      link_aprovar: `${siteUrl}/validar/${token}?acao=aprovar`,
      link_editar: `${siteUrl}/atualizar/${token}`,
      dias_validade: String(diasValidade)
    }
  });

  // Log de moderação
  const { data: adminPerfil } = await supabase
    .from('admin_perfil')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (adminPerfil) {
    await supabase.from('log_moderacao').insert({
      admin_id: adminPerfil.id,
      acao: 'enviou_solicitacao_atualizacao',
      experiencia_id: experienciaId,
      detalhes: { tipo: 'validacao_traducao' }
    });
  }

  return { ok: true };
}

// ─── Validação em lote ────────────────────────────────────────

export async function requestUpdateBulk(experienciaIds: string[]) {
  const supabase = createServiceRoleClient();
  const sessionClient = await createAdminSessionClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const { data: configDias } = await supabase
    .from('configuracao_sistema')
    .select('valor')
    .eq('chave', 'convite_atualizacao_dias_validade')
    .maybeSingle();
  const diasValidade = Number(configDias?.valor ?? 30);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

  const resultados: { id: string; ok: boolean; error?: string }[] = [];

  for (const experienciaId of experienciaIds) {
    try {
      const { data: exp } = await supabase
        .from('experiencia')
        .select('titulo')
        .eq('id', experienciaId)
        .single();

      const { data: epData } = await supabase
        .from('experiencia_pessoa')
        .select('pessoa(id, nome_completo, email)')
        .eq('experiencia_id', experienciaId)
        .eq('papel', 'coordenador')
        .limit(1)
        .maybeSingle();

      const pessoa = (epData?.pessoa as unknown) as { id: string; nome_completo: string; email: string } | null;
      if (!pessoa || !exp) {
        resultados.push({ id: experienciaId, ok: false, error: 'coordenador não encontrado' });
        continue;
      }

      const token = generateToken();
      const expiraEm = new Date(Date.now() + diasValidade * 24 * 60 * 60 * 1000).toISOString();

      await supabase.from('convite_atualizacao').insert({
        experiencia_id: experienciaId,
        pessoa_id: pessoa.id,
        token,
        expira_em: expiraEm,
        tipo: 'atualizacao_dados'
      });

      await supabase.from('experiencia').update({
        status: 'aguardando_confirmacao_coordenador'
      }).eq('id', experienciaId);

      await sendEmail({
        tipo: 'solicitacao_atualizacao',
        destinatario: pessoa.email,
        experienciaId,
        pessoaId: pessoa.id,
        vars: {
          coordenador_nome: pessoa.nome_completo,
          experiencia_titulo: exp.titulo,
          link_atualizacao: `${siteUrl}/atualizar/${token}`,
          dias_validade: String(diasValidade)
        }
      });

      const { data: adminPerfil } = await supabase
        .from('admin_perfil')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (adminPerfil) {
        await supabase.from('log_moderacao').insert({
          admin_id: adminPerfil.id,
          acao: 'enviou_solicitacao_atualizacao',
          experiencia_id: experienciaId
        });
      }

      resultados.push({ id: experienciaId, ok: true });
    } catch (e) {
      resultados.push({
        id: experienciaId,
        ok: false,
        error: e instanceof Error ? e.message : 'erro desconhecido'
      });
    }
  }

  return { ok: true, resultados };
}

// ─── Aprovação com e-mail ─────────────────────────────────────

export async function approveWithEmail(
  experienciaId: string,
  isPerene: boolean,
  motivo: string
) {
  const supabase = createServiceRoleClient();
  const sessionClient = await createAdminSessionClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const novoStatus = isPerene ? 'aprovada_ativa_perene' : 'aprovada_ativa_em_andamento';

  // Busca status atual + dados do coordenador em paralelo
  const [{ data: exp }, { data: epData }, { data: adminPerfil }] = await Promise.all([
    supabase
      .from('experiencia')
      .select('status, titulo')
      .eq('id', experienciaId)
      .single(),
    supabase
      .from('experiencia_pessoa')
      .select('pessoa(id, nome_completo, email)')
      .eq('experiencia_id', experienciaId)
      .eq('papel', 'coordenador')
      .limit(1)
      .maybeSingle(),
    supabase.from('admin_perfil').select('id').eq('id', user.id).maybeSingle()
  ]);

  // Atualiza status
  await supabase
    .from('experiencia')
    .update({ status: novoStatus, aprovada_em: new Date().toISOString() })
    .eq('id', experienciaId);

  // Histórico + log
  await Promise.all([
    supabase.from('historico_status').insert({
      experiencia_id: experienciaId,
      status_anterior: exp?.status,
      status_novo: novoStatus,
      motivo,
      alterado_por: user.id
    }),
    adminPerfil && supabase.from('log_moderacao').insert({
      admin_id: adminPerfil.id,
      acao: 'aprovou_experiencia',
      experiencia_id: experienciaId,
      detalhes: { motivo, novo_status: novoStatus }
    })
  ]);

  // Inicia tradução DeepL (marca como pendente — Edge Function processa)
  await supabase
    .from('experiencia_traducao')
    .upsert(
      { experiencia_id: experienciaId, idioma: 'en', titulo: '', status_global: 'pendente', provedor_api: 'deepl' },
      { onConflict: 'experiencia_id,idioma' }
    );

  // Envia e-mail de aprovação (não bloqueia se falhar)
  const pessoa = (epData?.pessoa as unknown) as { id: string; nome_completo: string; email: string } | null;
  if (pessoa && exp) {
    try {
      await sendEmail({
        tipo: 'aprovacao',
        destinatario: pessoa.email,
        experienciaId,
        pessoaId: pessoa.id,
        vars: {
          coordenador_nome: pessoa.nome_completo,
          experiencia_titulo: exp.titulo
        }
      });
    } catch (err) {
      console.warn('[approveWithEmail] falha ao enviar e-mail de aprovação:', err);
    }
  }

  return { ok: true };
}

// ─── Rejeição com e-mail ──────────────────────────────────────

export async function rejectWithEmail(experienciaId: string, motivo: string) {
  const supabase = createServiceRoleClient();
  const sessionClient = await createAdminSessionClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) throw new Error('Não autenticado');

  const [{ data: exp }, { data: epData }, { data: adminPerfil }] = await Promise.all([
    supabase
      .from('experiencia')
      .select('status, titulo')
      .eq('id', experienciaId)
      .single(),
    supabase
      .from('experiencia_pessoa')
      .select('pessoa(id, nome_completo, email)')
      .eq('experiencia_id', experienciaId)
      .eq('papel', 'coordenador')
      .limit(1)
      .maybeSingle(),
    supabase.from('admin_perfil').select('id').eq('id', user.id).maybeSingle()
  ]);

  await supabase
    .from('experiencia')
    .update({ status: 'rejeitada' })
    .eq('id', experienciaId);

  await Promise.all([
    supabase.from('historico_status').insert({
      experiencia_id: experienciaId,
      status_anterior: exp?.status,
      status_novo: 'rejeitada',
      motivo,
      alterado_por: user.id
    }),
    adminPerfil && supabase.from('log_moderacao').insert({
      admin_id: adminPerfil.id,
      acao: 'rejeitou_experiencia',
      experiencia_id: experienciaId,
      detalhes: { motivo }
    })
  ]);

  // Envia e-mail de rejeição (não bloqueia se falhar)
  const pessoa = (epData?.pessoa as unknown) as { id: string; nome_completo: string; email: string } | null;
  if (pessoa && exp) {
    try {
      await sendEmail({
        tipo: 'rejeicao',
        destinatario: pessoa.email,
        experienciaId,
        pessoaId: pessoa.id,
        vars: {
          coordenador_nome: pessoa.nome_completo,
          experiencia_titulo: exp.titulo,
          motivo_rejeicao: motivo
        }
      });
    } catch (err) {
      console.warn('[rejectWithEmail] falha ao enviar e-mail de rejeição:', err);
    }
  }

  return { ok: true };
}

// ─── Helper ─────────────────────────────────────────────────

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
