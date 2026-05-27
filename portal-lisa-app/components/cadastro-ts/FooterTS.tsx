import Image from 'next/image';

/**
 * Rodapé do formulário /cadastrar-ts — quatro logos institucionais
 * centralizados, fundo escuro com borda superior em azul TS.
 */
export function FooterTS() {
  return (
    <footer className="bg-ts-deep border-t border-ts-accent/40 mt-24">
      <div className="max-w-[1100px] mx-auto px-8 py-12">
        <div className="flex flex-wrap items-center justify-center gap-16 md:gap-28">
          {/* Caixa de mesma largura para todas as logos — object-contain mantém
              proporção de cada SVG, alinhando-as visualmente pela largura. */}
          <div className="w-[120px] h-[48px] relative">
            <Image
              src="/images/logo_rodape_1.svg"
              alt="Tecnologia Social"
              fill
              className="object-contain object-center opacity-90 scale-110"
            />
          </div>
          <div className="w-[120px] h-[48px] relative">
            <Image
              src="/images/logo_rodape_2.svg"
              alt="AGIR"
              fill
              className="object-contain object-center opacity-90 scale-90"
            />
          </div>
          <div className="w-[120px] h-[48px] relative">
            <Image
              src="/images/logo_rodape_3.svg"
              alt="PROPPI"
              fill
              className="object-contain object-center opacity-90"
            />
          </div>
          <div className="w-[120px] h-[48px] relative">
            <Image
              src="/images/logo_rodape_4.svg"
              alt="UFF"
              fill
              className="object-contain object-center opacity-90"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
