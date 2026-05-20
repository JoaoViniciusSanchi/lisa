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
  reducer,
  type Action,
  type CadastroState
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

export function FormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const hydratedRef = useRef(false);
  const draftSavedAtRef = useRef<number | null>(null);

  // Hidratação do localStorage no mount (evita SSR mismatch)
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          // `arquivos` (File) não serializa — sempre começa vazio.
          // Se vier algo persistido por engano (versões antigas), descarta.
          delete parsed.arquivos;
          dispatch({ type: 'HYDRATE', state: parsed });
        }
      }
    } catch (e) {
      console.warn('[FormProvider] falha ao hidratar localStorage:', e);
    }
  }, []);

  // Auto-save com debounce 600ms
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydratedRef.current) return;
    // Não salvar se já foi submetido com sucesso
    if (state.protocolo) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        // Remove campos que não serializam ou que são transient.
        const { arquivos: _arquivos, ...rest } = state;
        const toSave = { ...rest, submitting: false, submitError: null };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        draftSavedAtRef.current = Date.now();
        // Trigger UI re-render via custom event (DraftIndicator escuta)
        window.dispatchEvent(new CustomEvent('lisa-draft-saved'));
      } catch (e) {
        console.warn('[FormProvider] falha ao salvar localStorage:', e);
      }
    }, 600);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[FormProvider] falha ao limpar localStorage:', e);
    }
  }, []);

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
