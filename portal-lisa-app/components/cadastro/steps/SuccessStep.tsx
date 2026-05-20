'use client';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ArrowRight, Check } from '@/components/ui/icons';
import { useCadastroForm } from '../FormProvider';

export function SuccessStep() {
  const { state } = useCadastroForm();

  return (
    <div className="text-center max-w-[700px] mx-auto mt-16">
      <div className="w-20 h-20 border border-accent bg-[rgba(46,163,155,0.08)] flex items-center justify-center mx-auto mb-10">
        <Check width={36} height={36} className="text-accent-glow" />
      </div>

      <Eyebrow as="div" className="mb-6">
        Envio realizado com sucesso
      </Eyebrow>

      <h1 className="font-display text-[clamp(40px,5vw,72px)] font-extralight leading-[1.05] tracking-[-0.04em] mb-6">
        Sua experiência foi
        <br />
        <span className="italic font-thin text-accent-glow">registrada.</span>
      </h1>

      <p className="text-base opacity-65 leading-relaxed mb-10">
        Recebemos seu cadastro e encaminhamos para análise da equipe AGIR.
        Você receberá um e-mail de confirmação em instantes e uma atualização
        sobre o status em até 7 dias úteis.
      </p>

      {state.protocolo && (
        <div className="inline-block px-10 py-6 bg-bg-elevated border border-line-strong mb-10">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-glow mb-2">
            Protocolo de envio
          </div>
          <div className="font-display text-2xl font-light tracking-[0.05em]">
            {state.protocolo}
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center flex-wrap">
        <Link href="/">
          <Button>
            Voltar ao portal
            <ArrowRight width={16} height={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
