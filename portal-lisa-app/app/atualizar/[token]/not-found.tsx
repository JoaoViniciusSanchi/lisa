import Link from 'next/link';

// Exibido quando o token é inválido, expirado ou já respondido
export default function AtualizarNotFound() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-8">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="font-display text-2xl font-bold text-warm-white mb-4">
          Link inválido ou expirado
        </h1>
        <p className="text-warm-white/60 leading-relaxed mb-8">
          Este link de atualização não é mais válido. Ele pode ter expirado ou já ter sido
          utilizado anteriormente.
        </p>
        <p className="text-warm-white/40 text-sm mb-8">
          Se precisar atualizar os dados da sua experiência, entre em contato com a
          Coordenação de Tecnologia Social — AGIR/UFF.
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
