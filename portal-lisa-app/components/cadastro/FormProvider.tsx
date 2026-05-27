'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode
} from 'react';
import {
  INITIAL_STATE,
  STEPS,
  reducer,
  type Action,
  type CadastroState,
  type TipoOrigem
} from './state';

const STORAGE_KEY = 'lisa_cadastro_draft_v1';

interface FormContextValue {
  state: CadastroState;
  dispatch: (action: Action) => void;
  /** Limpa o rascunho do localStorage. Chamar após submit bem-sucedido. */
  clearDraft: () => void;
  /** Indica que houve auto-save recente (para o DraftIndicator). */
  draftSavedAt: number | null;
}

const FormContext = createContext<FormContextValue | null>(null);

interface FormProviderProps {
  children: ReactNode;
  /** Dados iniciais para pré-preencher o formulário (modo edição). */
  initialData?: Partial<CadastroState>;
  /** 'cadastro' (default) ou 'edicao' (link mágico). */
  modo?: 'cadastro' | 'edicao';
  /**
   * Tipo de origem da submissão — definido pela página antes do formulário.
   * - 'interna_edital': edital ativo → catalogo_ts=true
   * - 'interna': fora do edital, vínculo UFF
   * - 'externa': sem vínculo UFF
   */
  tipoOrigem?: TipoOrigem;
}

export function FormProvider({
  children,
  initialData,
  modo = 'cadastro',
  tipoOrigem = 'interna'
}: FormProviderProps) {
  const isEdicao = modo === 'edicao';

  // Estado inicial: considera modo e tipoOrigem
  const baseState: CadastroState = isEdicao
    ? {
        ...INITIAL_STATE,
        ...initialData,
        // Em modo edição, começar na primeira etapa de cadastro
        currentStep: STEPS.IDENTIFICACAO,
        modo: 'edicao'
      }
    : {
        ...INITIAL_STATE,
        tipoOrigem
      };

  const [state, dispatch] = useReducer(reducer, baseState);
  const hydratedRef = useRef(false);
  const draftSavedAtRef = useRef<number | null>(null);

  // Hidratação do localStorage no mount — apenas no modo cadastro
  useEffect(() => {
    if (isEdicao) return; // Não lê localStorage em modo edição
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // `arquivos` (File) não serializa — sempre começa vazio.
          delete parsed.arquivos;
          dispatch({ type: 'HYDRATE', state: parsed });
        }
      }
    } catch (e) {
      console.warn('[FormProvider] falha ao hidratar localStorage:', e);
    }
  }, [isEdicao]);

  // Auto-save com debounce 600ms — desabilitado em modo edição
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isEdicao) return; // Não salva localStorage em modo edição
    if (!hydratedRef.current) return;
    if (state.protocolo) return; // Não salvar após submit bem-sucedido

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        const { arquivos: _arquivos, ...rest } = state;
        const toSave = { ...rest, submitting: false, submitError: null };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        draftSavedAtRef.current = Date.now();
        window.dispatchEvent(new CustomEvent('lisa-draft-saved'));
      } catch (e) {
        console.warn('[FormProvider] falha ao salvar localStorage:', e);
      }
    }, 600);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state, isEdicao]);

  const clearDraft = useCallback(() => {
    if (isEdicao) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[FormProvider] falha ao limpar localStorage:', e);
    }
  }, [isEdicao]);

  return (
    <FormContext.Provider
      value={{
        state,
        dispatch,
        clearDraft,
        draftSavedAt: draftSavedAtRef.current
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useCadastroForm(): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error('useCadastroForm precisa estar dentro de FormProvider');
  }
  return ctx;
}
