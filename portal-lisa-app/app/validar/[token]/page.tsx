import { createServiceRoleClient } from '@/lib/supabase/server';
import Link from 'next/link';

interface Props {
  params: { token: string };
  searchParams: { acao?: string };
}

export default async function ValidarPage({ params, searchParams }: Props) {
  const { token } = params;
  const acao = searchParams.acao; // 'aprovar' ou ausente
  const supabase = createServiceRoleClient();

  // 1. Validar convite
  const { data: convite } = await supabase
    .from('convite_atualizacao')
    .select('*, experiencia(id, titulo)')
    .eq('token', token)
    .eq('tipo', 'validacao_traducao')
    .maybeSingle();

  if (!convite || convite.respondido_em || new Date(convite.expira_em) < new Date()) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center px-8">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="font-display text-2xl font-bold text-warm-white mb-4">
            Link inválido ou expirado
          </h1>
          <p className="text-warm-white/60 leading-relaxed mb-8">
            Este link de validação não é mais válido. Entre em contato com a coordenação.
          </p>
          <Link href="/pt" className="inline-block bg-accent text-bg-base px-6 py-3 text-sm font-medium hover:bg-accent/90 transition-colors">
            Voltar ao Portal LISA
          </Link>
        </div>
      </div>
    );
  }

  const experiencia = convite.experiencia as { id: string; titulo: string };

  let mensagem: string;
  let titulo: string;
  let emoji: string;

  if (acao === 'aprovar') {
    // 2a. Aprovar tradução: status_global → 'publicavel'
    await supabase
      .from('experiencia_traducao')
      .update({ status_global: 'publicavel', atualizada_em: new Date().toISOString() })
      .eq('experiencia_id', experiencia.id)
      .eq('idioma', 'en');

    // Marcar convite como respondido
    await supabase
      .from('convite_atualizacao')
      .update({
        respondido_em: new Date().toISOString(),
        resposta: 'aprovou_traducao'
      })
      .eq('id', convite.id);

    emoji = '✅';
    titulo = 'Tradução aprovada com sucesso!';
    mensagem = `Obrigado(a) por revisar a tradução de "${experiencia.titulo}". A tradução foi marcada como aprovada e aguarda revisão final pela nossa equipe antes de ser publicada no catálogo.`;
  } else {
    // 2b. Ação não reconhecida — redirecionar para not-found
    emoji = '❓';
    titulo = 'Ação não reconhecida';
    mensagem = 'Por favor, use os botões do e-mail para aprovar ou editar a tradução.';
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-8">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">{emoji}</div>
        <h1 className="font-display text-2xl font-bold text-warm-white mb-4">
          {titulo}
        </h1>
        <p className="text-warm-white/60 leading-relaxed mb-8">
          {mensagem}
        </p>
        <Link
          href="/pt"
          className="inline-block bg-accent text-bg-base px-6 py-3 text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          Voltar ao Portal LISA
        </Link>
      </div>
    </div>
  );
}
