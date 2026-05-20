'use client';

import { Button } from '@/components/ui/Button';
import { ArrowRight, ArrowLeft } from '@/components/ui/icons';
import { submitCadastroWithFiles } from '@/lib/actions/submit-cadastro';
import { useCadastroForm } from './FormProvider';
import {
  STEPS,
  TRIAGEM_STEPS,
  CADASTRO_STEPS,
  type CadastroState
} from './state';

export function CadastroNavigation() {
  const { state, dispatch, clearDraft } = useCadastroForm();
  const step = state.currentStep;

  const isTriagem = TRIAGEM_STEPS.includes(step as never);
  const isCadastro = CADASTRO_STEPS.includes(step as never);

  // Esconde nav em welcome, result e success
  if (step === STEPS.WELCOME || step === STEPS.RESULT || step === STEPS.SUCCESS) {
    return null;
  }

  const isLastTriagem = step === STEPS.TRIAGEM_R;
  const isLastCadastro = step === STEPS.RESULTADOS_MATERIAIS;

  const meta = isTriagem
    ? `Triagem · ${TRIAGEM_STEPS.indexOf(step as never) + 1} de 5`
    : isCadastro
      ? `Cadastro · ${CADASTRO_STEPS.indexOf(step as never) + 1} de 8`
      : '';

  function handleNext() {
    if (isLastTriagem) {
      dispatch({ type: 'SET_STEP', step: STEPS.RESULT });
      return;
    }
    if (isLastCadastro) {
      handleSubmit();
      return;
    }
    dispatch({ type: 'SET_STEP', step: step + 1 });
  }

  function handlePrev() {
    if (step === STEPS.IDENTIFICACAO) {
      dispatch({ type: 'SET_STEP', step: STEPS.RESULT });
      return;
    }
    if (step > STEPS.WELCOME) {
      dispatch({ type: 'SET_STEP', step: step - 1 });
    }
  }

  async function handleSubmit() {
    if (!state.termoAceito) {
      dispatch({
        type: 'SET_SUBMIT_ERROR',
        error: 'É preciso aceitar os termos antes de enviar.'
      });
      return;
    }

    // Validação client-side de campos obrigatórios. Se faltar algo,
    // listamos os nomes dos campos e pulamos para a primeira etapa
    // que tem pendência — assim o coordenador vê o que precisa preencher.
    const missing = collectMissingRequired(state);
    if (missing.length > 0) {
      const list = missing.map((m) => `"${m.label}"`).join(', ');
      const verbo = missing.length === 1 ? 'está vazio' : 'estão vazios';
      dispatch({
        type: 'SET_SUBMIT_ERROR',
        error: `Antes de enviar, preencha o${missing.length === 1 ? '' : 's'} campo${missing.length === 1 ? '' : 's'}: ${list} (${verbo}).`
      });
      dispatch({ type: 'SET_STEP', step: missing[0].step });
      return;
    }

    dispatch({ type: 'SET_SUBMITTING', submitting: true });
    dispatch({ type: 'SET_SUBMIT_ERROR', error: null });

    try {
      const formData = new FormData();
      formData.set('payload', JSON.stringify(buildPayload(state)));
      if (state.arquivos.capa) formData.set('capa', state.arquivos.capa);
      if (state.arquivos.secundaria1)
        formData.set('secundaria1', state.arquivos.secundaria1);
      if (state.arquivos.secundaria2)
        formData.set('secundaria2', state.arquivos.secundaria2);

      const result = await submitCadastroWithFiles(formData);
      if (result.success && result.protocolo) {
        dispatch({ type: 'SET_PROTOCOL', protocolo: result.protocolo });
        dispatch({ type: 'SET_STEP', step: STEPS.SUCCESS });
        clearDraft();
      } else {
        dispatch({
          type: 'SET_SUBMIT_ERROR',
          error: result.error ?? 'Erro desconhecido ao enviar'
        });
      }
    } catch (e) {
      dispatch({
        type: 'SET_SUBMIT_ERROR',
        error: e instanceof Error ? e.message : 'Erro desconhecido ao enviar'
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', submitting: false });
    }
  }

  return (
    <div className="flex justify-between items-center mt-16 pt-10 border-t border-line">
      <Button variant="secondary" onClick={handlePrev}>
        <ArrowLeft width={14} height={14} />
        Anterior
      </Button>

      <div className="text-[11px] tracking-[0.1em] uppercase opacity-40">
        {meta}
      </div>

      <div className="flex flex-col items-end gap-2">
        <Button onClick={handleNext} disabled={state.submitting}>
          {state.submitting
            ? 'Enviando...'
            : isLastCadastro
              ? 'Enviar cadastro'
              : isLastTriagem
                ? 'Ver resultado da triagem'
                : 'Próximo'}
          {!state.submitting && <ArrowRight width={14} height={14} />}
        </Button>
        {state.submitError && (
          <div className="text-xs text-danger max-w-[300px] text-right leading-relaxed">
            {state.submitError}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================
// Validação de obrigatórios — devolve lista com nome do campo e
// a etapa onde ele aparece (para pular pra lá automaticamente).
// =============================================================

interface MissingField {
  label: string;
  step: number;
}

function collectMissingRequired(state: CadastroState): MissingField[] {
  const missing: MissingField[] = [];

  // Identificação
  if (!state.identificacao.coordNome.trim()) {
    missing.push({
      label: 'Nome completo do coordenador(a)',
      step: STEPS.IDENTIFICACAO
    });
  }
  if (!state.identificacao.coordEmail.trim()) {
    missing.push({
      label: 'E-mail institucional',
      step: STEPS.IDENTIFICACAO
    });
  }
  if (!state.identificacao.coordVinculo) {
    missing.push({
      label: 'Vínculo com a UFF',
      step: STEPS.IDENTIFICACAO
    });
  }

  // Experiência
  if (!state.experiencia.titulo.trim()) {
    missing.push({
      label: 'Título da experiência',
      step: STEPS.EXPERIENCIA
    });
  }

  // Macroarea principal obrigatória
  if (!state.classificacoes.macroareaPrincipalCodigo) {
    missing.push({
      label: 'Macroarea temática principal',
      step: STEPS.MACROAREAS
    });
  }

  return missing;
}

// =============================================================
// Mapper: state → payload do server action
// =============================================================

function buildPayload(state: CadastroState) {
  return {
    identificacao: {
      coordNome: state.identificacao.coordNome,
      coordEmail: state.identificacao.coordEmail,
      coordTelefone: state.identificacao.coordTelefone || undefined,
      coordLattes: state.identificacao.coordLattes || undefined,
      coordVinculo: state.identificacao.coordVinculo || undefined,
      coordDepartamento: state.identificacao.coordDepartamento || undefined,
      viceNome: state.identificacao.viceNome || undefined,
      viceEmail: state.identificacao.viceEmail || undefined
    },
    experiencia: {
      titulo: state.experiencia.titulo,
      historico: state.experiencia.historico,
      metodologia: state.experiencia.metodologia,
      dataInicio: state.experiencia.dataInicio
        ? `${state.experiencia.dataInicio}-01`
        : undefined,
      isPerene: state.experiencia.statusExperiencia === 'perene',
      statusExperiencia: state.experiencia.statusExperiencia || 'em_andamento',
      campus: state.experiencia.campus || undefined,
      municipio: state.experiencia.municipio || undefined,
      uf: state.experiencia.uf || undefined
    } as const,
    classificacoes: {
      macroareaPrincipalCodigo: state.classificacoes.macroareaPrincipalCodigo ?? undefined,
      macroareasSecundariasCodigos: state.classificacoes.macroareasSecundariasCodigos,
      cnpqGrandeAreaCodigo: state.classificacoes.cnpqGrandeAreaNome || undefined,
      cnpqSubareaCodigos: state.classificacoes.cnpqSubareaCodigos,
      odsIds: state.classificacoes.odsIds,
      categoriaEditorialNome:
        state.classificacoes.categoriaEditorialNome || undefined,
      finalidadeSocialCodigos: state.classificacoes.finalidadeSocialCodigos,
      forproexCodigos: state.classificacoes.forproexCodigos,
      publicoAlvoCodigos: state.classificacoes.publicoAlvoCodigos,
      tipoSolucaoCodigos: state.classificacoes.tipoSolucaoCodigos,
      arranjoCodigos: state.classificacoes.arranjoCodigos
    },
    fuzzyAnswers: state.fuzzyAnswers,
    justificativas: state.justificativas,
    resultados: {
      resultadosImpactos: state.resultados.resultadosImpactos,
      desafiosPerspectivas: state.resultados.desafiosPerspectivas,
      publicoBeneficiado: state.resultados.publicoBeneficiado || undefined,
      numPessoasAtendidas: state.resultados.numPessoasAtendidas
        ? Number(state.resultados.numPessoasAtendidas)
        : undefined,
      fontesFinanciamento: state.resultados.fontesFinanciamento || undefined,
      parcerias: state.resultados.parcerias || undefined
    },
    materiais: {
      instagram: state.materiais.instagram || undefined,
      siteExterno: state.materiais.siteExterno || undefined,
      youtube: state.materiais.youtube || undefined,
      facebook: state.materiais.facebook || undefined,
      linksAdicionais: state.materiais.linksAdicionais || undefined
    },
    termoAceito: state.termoAceito,
    meta: {
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    }
  };
}
