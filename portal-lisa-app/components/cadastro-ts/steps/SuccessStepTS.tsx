'use client';

import { Link } from '@/i18n/routing';
import { ButtonTS } from '../ButtonTS';
import { EyebrowTS } from '../EyebrowTS';
import { ArrowRight, Check } from '@/components/ui/icons';
import { useCadastroForm } from '@/components/cadastro/FormProvider';

export function SuccessStepTS() {
  const { state } = useCadastroForm();

  return (
    <div className="text-center max-w-[700px] mx-auto mt-16 font-nunito">
      <div className="w-20 h-20 border border-ts-accent bg-[rgba(12,113,195,0.12)] flex items-center justify-center mx-auto mb-10">
        <Check width={36} height={36} className="text-ts-accent" />
      </div>

      <EyebrowTS as="div" className="mb-6">
        Envio realizado com sucesso
      </EyebrowTS>

      <h1 className="font-nunito text-[clamp(40px,5vw,72px)] font-light leading-[1.05] tracking-[-0.04em] mb-6 text-white">
        Sua experiência foi
        <br />
        <span className="italic font-thin text-ts-accent">registrada.</span>
      </h1>

      <p className="text-base text-white/75 leading-relaxed mb-10">
        Recebemos seu cadastro e encaminhamos para análise da equipe AGIR.
        Você receberá um e-mail de confirmação em instantes e uma atualização
        sobre o status em até 7 dias úteis.
      </p>

      {state.protocolo && (
        <div className="inline-block px-10 py-6 bg-ts-mid border border-white/15 mb-10">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-ts-accent mb-2">
            Protocolo de envio
          </div>
          <div className="font-nunito text-2xl font-light tracking-[0.05em] text-white">
            {state.protocolo}
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-center flex-wrap">
        <Link href="/">
          <ButtonTS>
            Voltar ao portal
            <ArrowRight width={16} height={16} />
          </ButtonTS>
        </Link>
      </div>
    </div>
  );
}
