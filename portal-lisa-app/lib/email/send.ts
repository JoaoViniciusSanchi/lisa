// Função central de envio de e-mail — lê template do banco ou usa default,
// renderiza, chama Resend e registra em disparo_email.
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getResendClient } from './client';
import { EMAIL_DEFAULTS } from './defaults';
import { renderEmail } from './render';

export interface SendEmailParams {
  tipo: string;
  destinatario: string;
  vars: Record<string, string>;
  experienciaId?: string;
  pessoaId?: string;
}

export interface SendEmailResult {
  ok: boolean;
  resend_id?: string;
  error?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { tipo, destinatario, vars, experienciaId, pessoaId } = params;
  const supabase = createServiceRoleClient();
  const fromAddress = process.env.EMAIL_FROM_ADDRESS ?? 'LISA <nao-responda@agir.uff.br>';

  // 1. Buscar template personalizado no banco
  let assunto: string;
  let corpo_md: string;

  const { data: config } = await supabase
    .from('configuracao_sistema')
    .select('valor')
    .eq('chave', `template_email_${tipo}`)
    .maybeSingle();

  const configValor = config?.valor as { usar_padrao?: boolean; assunto?: string; corpo_md?: string } | null;

  if (configValor && !configValor.usar_padrao && configValor.assunto && configValor.corpo_md) {
    // Template personalizado pelo admin
    assunto = configValor.assunto;
    corpo_md = configValor.corpo_md;
  } else {
    // Fallback para default em código
    const def = EMAIL_DEFAULTS[tipo];
    if (!def) {
      return { ok: false, error: `email_tipo desconhecido: ${tipo}` };
    }
    assunto = def.assunto;
    corpo_md = def.corpo_md;
  }

  // 2. Renderizar (vars + Markdown → HTML)
  const { html, assunto: assuntoFinal } = renderEmail(corpo_md, assunto, vars);

  // 3. Enviar via Resend
  let resendId: string | undefined;
  let erroMensagem: string | undefined;
  let statusEmail: 'enviado' | 'falhou' = 'enviado';

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: destinatario,
      subject: assuntoFinal,
      html
    });

    if (error) {
      erroMensagem = error.message;
      statusEmail = 'falhou';
    } else {
      resendId = data?.id;
    }
  } catch (e) {
    erroMensagem = e instanceof Error ? e.message : 'erro desconhecido ao chamar Resend';
    statusEmail = 'falhou';
  }

  // 4. Registrar em disparo_email (auditoria + suporte a reenvio)
  await supabase.from('disparo_email').insert({
    experiencia_id: experienciaId ?? null,
    pessoa_id: pessoaId ?? null,
    tipo,
    destinatario,
    assunto: assuntoFinal,
    corpo_html: html,
    status: statusEmail,
    enviado_em: statusEmail === 'enviado' ? new Date().toISOString() : null,
    resend_id: resendId ?? null,
    erro_mensagem: erroMensagem ?? null
  });

  if (statusEmail === 'falhou') {
    return { ok: false, error: erroMensagem };
  }
  return { ok: true, resend_id: resendId };
}
