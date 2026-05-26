import { createServiceRoleClient } from '@/lib/supabase/server';
import { EmailsClient } from '@/components/admin/EmailsClient';

export default async function EmailsPage() {
  const supabase = createServiceRoleClient();

  // Carregar todos os templates configurados
  const { data: configs } = await supabase
    .from('configuracao_sistema')
    .select('chave, valor')
    .like('chave', 'template_email_%');

  // Carregar últimos 50 disparos
  const { data: disparos } = await supabase
    .from('disparo_email')
    .select('id, tipo, destinatario, assunto, status, enviado_em, criado_em, resend_id, erro_mensagem, experiencia_id')
    .order('criado_em', { ascending: false })
    .limit(50);

  // Mapear templates por tipo (remove prefixo 'template_email_')
  const templates: Record<string, { usar_padrao: boolean; assunto: string | null; corpo_md: string | null }> = {};
  for (const c of configs ?? []) {
    const tipo = c.chave.replace('template_email_', '');
    templates[tipo] = c.valor as { usar_padrao: boolean; assunto: string | null; corpo_md: string | null };
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-warm-white mb-1">E-mails</h1>
        <p className="text-warm-white/40 text-[13px]">
          Gerencie os templates de e-mail transacional e visualize o histórico de disparos.
        </p>
      </div>

      <EmailsClient
        templates={templates}
        disparos={disparos ?? []}
      />
    </div>
  );
}
