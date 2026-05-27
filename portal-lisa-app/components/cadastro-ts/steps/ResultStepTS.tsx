'use client';

import { useEffect, useRef, useState } from 'react';
import { ButtonTS } from '../ButtonTS';
import { EyebrowTS } from '../EyebrowTS';
import { Link } from '@/i18n/routing';
import { ArrowRight } from '@/components/ui/icons';
import { runTriagem } from '@/lib/actions/triagem';
import { FuzzyResultGaugeTS } from '../FuzzyResultGaugeTS';
import { DimensionBreakdownTS } from '../DimensionBreakdownTS';
import { useCadastroForm } from '@/components/cadastro/FormProvider';
import { STEPS } from '@/components/cadastro/state';

const COPY_BY_FAIXA = {
  verde: {
    eyebrowSuffix: 'Alta aderência',
    titlePrefix: 'Sua experiência tem',
    titleAccent: 'alta aderência',
    titleSuffix: 'às tecnologias sociais.',
    message:
      'Com base nas respostas da triagem, sua iniciativa demonstra forte alinhamento com os parâmetros que caracterizam uma tecnologia social. Você está habilitado a prosseguir com o cadastro completo da experiência.'
  },
  amarelo: {
    eyebrowSuffix: 'Média aderência',
    titlePrefix: 'Sua experiência está em',
    titleAccent: 'transição',
    titleSuffix: 'para tecnologia social.',
    message:
      'Sua iniciativa apresenta características importantes de tecnologia social, mas ainda há dimensões em desenvolvimento. Você está habilitado a prosseguir com o cadastro — a equipe de moderação poderá oferecer observações construtivas sobre como fortalecer a experiência.'
  },
  vermelho: {
    eyebrowSuffix: 'Baixa aderência',
    titlePrefix: 'Sua experiência ainda não atende',
    titleAccent: 'os parâmetros mínimos',
    titleSuffix: '.',
    message:
      'A AGIR/UFF adota parâmetros qualitativos e quantitativos para garantir que as experiências do catálogo sejam efetivamente tecnologias sociais. Agradecemos profundamente seu interesse e sua dedicação — você pode retornar em outro momento para tentar novamente ou cadastrar uma nova experiência.'
  }
} as const;

export function ResultStepTS() {
  const { state, dispatch } = useCadastroForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const calculatedRef = useRef(false);

  useEffect(() => {
    if (calculatedRef.current) return;
    calculatedRef.current = true;

    setLoading(true);
    runTriagem(state.fuzzyAnswers)
      .then((response) => {
        dispatch({
          type: 'SET_TRIAGEM_RESULT',
          result: response.result,
          blocked: !response.liberado,
          gateThreshold: response.gateThreshold
        });
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Erro ao calcular triagem');
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = state.triagemResult;
  const blocked = state.triagemBlocked;

  if (loading || !result) {
    return (
      <div className="text-center py-32 font-nunito">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/65 mb-4">
          Calculando...
        </div>
        <div className="text-sm text-white/55">
          Processando suas respostas no motor fuzzy do servidor.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-32 font-nunito">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-danger mb-4">
          Erro
        </div>
        <div className="text-sm text-white/70 mb-8">{error}</div>
        <ButtonTS
          variant="secondary"
          onClick={() => dispatch({ type: 'SET_STEP', step: STEPS.TRIAGEM_R })}
        >
          Voltar e tentar novamente
        </ButtonTS>
      </div>
    );
  }

  const copy = COPY_BY_FAIXA[result.faixa];

  return (
    <div className="max-w-[780px] mx-auto text-center font-nunito">
      <EyebrowTS as="div" className="mb-6">
        Resultado da triagem · {copy.eyebrowSuffix}
      </EyebrowTS>

      <FuzzyResultGaugeTS indice={result.indice_fuzzy} faixa={result.faixa} />

      <h2 className="font-nunito text-[clamp(36px,5vw,64px)] font-light leading-[1.05] tracking-[-0.04em] mb-6 text-white">
        {copy.titlePrefix}{' '}
        <span
          className="italic font-light"
          style={{
            color:
              result.faixa === 'verde'
                ? '#3FBDB4'
                : result.faixa === 'amarelo'
                  ? '#E5B842'
                  : '#E55542'
          }}
        >
          {copy.titleAccent}
        </span>{' '}
        {copy.titleSuffix.replace('.', '')}
      </h2>

      <p className="text-base leading-[1.65] text-white/80 mb-12 max-w-[600px] mx-auto">
        {copy.message}
      </p>

      <DimensionBreakdownTS medias={result.medias} />

      {!blocked ? (
        <ButtonTS
          onClick={() => dispatch({ type: 'SET_STEP', step: STEPS.IDENTIFICACAO })}
        >
          Continuar para o cadastro
          <ArrowRight width={16} height={16} />
        </ButtonTS>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/">
            <ButtonTS>Voltar ao portal</ButtonTS>
          </Link>
          <ButtonTS
            variant="secondary"
            onClick={() => dispatch({ type: 'RESET_TRIAGEM' })}
          >
            Refazer triagem
          </ButtonTS>
        </div>
      )}
    </div>
  );
}
