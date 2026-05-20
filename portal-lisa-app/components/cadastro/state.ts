import type { FuzzyAnswers, FuzzyResult, DimensionKey } from '@/lib/fuzzy/types';

// =============================================================
// STEP CONSTANTS — 16 painéis (0-15)
// Fase 1: WELCOME(0) + TRIAGEM(1-5) + RESULT(6)
// Fase 2: 8 etapas de cadastro (7-14) + SUCCESS(15)
// =============================================================

export const STEPS = {
  WELCOME: 0,
  TRIAGEM_P: 1,
  TRIAGEM_I: 2,
  TRIAGEM_A: 3,
  TRIAGEM_S: 4,
  TRIAGEM_R: 5,
  RESULT: 6,
  IDENTIFICACAO: 7,       // Etapa 01
  EXPERIENCIA: 8,         // Etapa 02
  MACROAREAS: 9,          // Etapa 03 (nova — classificação temática)
  CNPQ_ODS: 10,           // Etapa 04 (era 03)
  FINALIDADE: 11,         // Etapa 05 (era 04)
  FORPROEX: 12,           // Etapa 06 (era 05)
  OUTRAS_CLASS: 13,       // Etapa 07 (era 06, sem base teórica)
  RESULTADOS_MATERIAIS: 14, // Etapa 08 (fusão de Resultados + Materiais)
  SUCCESS: 15
} as const;

export const TRIAGEM_STEPS = [
  STEPS.TRIAGEM_P,
  STEPS.TRIAGEM_I,
  STEPS.TRIAGEM_A,
  STEPS.TRIAGEM_S,
  STEPS.TRIAGEM_R
];

export const CADASTRO_STEPS = [
  STEPS.IDENTIFICACAO,
  STEPS.EXPERIENCIA,
  STEPS.MACROAREAS,
  STEPS.CNPQ_ODS,
  STEPS.FINALIDADE,
  STEPS.FORPROEX,
  STEPS.OUTRAS_CLASS,
  STEPS.RESULTADOS_MATERIAIS
];

export const TRIAGEM_DIMENSION_BY_STEP: Record<number, DimensionKey> = {
  [STEPS.TRIAGEM_P]: 'P',
  [STEPS.TRIAGEM_I]: 'I',
  [STEPS.TRIAGEM_A]: 'A',
  [STEPS.TRIAGEM_S]: 'S',
  [STEPS.TRIAGEM_R]: 'R'
};

// =============================================================
// FORM STATE
// =============================================================

export interface IdentificacaoData {
  coordNome: string;
  coordEmail: string;
  coordTelefone: string;
  coordLattes: string;
  coordVinculo: string;
  coordDepartamento: string;
  viceNome: string;
  viceEmail: string;
}

export interface ExperienciaData {
  titulo: string;
  historico: string;
  metodologia: string;
  dataInicio: string;
  statusExperiencia: 'em_andamento' | 'perene' | 'com_data_fim' | 'encerrada' | '';
  campus: string;
  municipio: string;
  uf: string;
}

export interface ClassificacoesData {
  // Etapa 03 — Macroareas
  macroareaPrincipalCodigo: string | null;
  macroareasSecundariasCodigos: string[];
  // Etapa 04 — CNPq + ODS
  cnpqGrandeAreaNome: string;
  cnpqSubareaCodigos: string[];
  odsIds: number[];
  // Demais
  categoriaEditorialNome: string;
  finalidadeSocialCodigos: string[];
  forproexCodigos: string[];
  publicoAlvoCodigos: string[];
  tipoSolucaoCodigos: string[];
  arranjoCodigos: string[];
}

export interface ResultadosData {
  resultadosImpactos: string;
  desafiosPerspectivas: string;
  publicoBeneficiado: string;
  numPessoasAtendidas: string;
  fontesFinanciamento: string;
  parcerias: string;
}

export interface MateriaisData {
  instagram: string;
  siteExterno: string;
  youtube: string;
  facebook: string;
  linksAdicionais: string;
}

export type ArquivoSlot = 'capa' | 'secundaria1' | 'secundaria2';

export interface ArquivosData {
  capa: File | null;
  secundaria1: File | null;
  secundaria2: File | null;
}

export interface CadastroState {
  currentStep: number;

  // Triagem
  fuzzyAnswers: FuzzyAnswers;
  justificativas: Partial<Record<DimensionKey, string>>;
  triagemResult: FuzzyResult | null;
  triagemBlocked: boolean;
  gateThreshold: number;

  // Cadastro completo
  identificacao: IdentificacaoData;
  experiencia: ExperienciaData;
  classificacoes: ClassificacoesData;
  resultados: ResultadosData;
  materiais: MateriaisData;
  // Arquivos vivem APENAS em memória — File não serializa em JSON,
  // então não entram no auto-save do localStorage.
  arquivos: ArquivosData;
  termoAceito: boolean;

  // Submit state
  submitting: boolean;
  protocolo: string | null;
  submitError: string | null;
}

export const INITIAL_FUZZY_ANSWERS: FuzzyAnswers = {
  P: [5, 5, 5, 5],
  I: [5, 5, 5, 5],
  A: [5, 5, 5, 5],
  S: [5, 5, 5, 5],
  R: [5, 5, 5, 5]
};

export const INITIAL_STATE: CadastroState = {
  currentStep: STEPS.WELCOME,
  fuzzyAnswers: INITIAL_FUZZY_ANSWERS,
  justificativas: {},
  triagemResult: null,
  triagemBlocked: false,
  gateThreshold: 0.3,
  identificacao: {
    coordNome: '',
    coordEmail: '',
    coordTelefone: '',
    coordLattes: '',
    coordVinculo: '',
    coordDepartamento: '',
    viceNome: '',
    viceEmail: ''
  },
  experiencia: {
    titulo: '',
    historico: '',
    metodologia: '',
    dataInicio: '',
    statusExperiencia: '',
    campus: '',
    municipio: '',
    uf: ''
  },
  classificacoes: {
    macroareaPrincipalCodigo: null,
    macroareasSecundariasCodigos: [],
    cnpqGrandeAreaNome: '',
    cnpqSubareaCodigos: [],
    odsIds: [],
    categoriaEditorialNome: '',
    finalidadeSocialCodigos: [],
    forproexCodigos: [],
    publicoAlvoCodigos: [],
    tipoSolucaoCodigos: [],
    arranjoCodigos: []
  },
  resultados: {
    resultadosImpactos: '',
    desafiosPerspectivas: '',
    publicoBeneficiado: '',
    numPessoasAtendidas: '',
    fontesFinanciamento: '',
    parcerias: ''
  },
  materiais: {
    instagram: '',
    siteExterno: '',
    youtube: '',
    facebook: '',
    linksAdicionais: ''
  },
  arquivos: {
    capa: null,
    secundaria1: null,
    secundaria2: null
  },
  termoAceito: false,
  submitting: false,
  protocolo: null,
  submitError: null
};

// =============================================================
// REDUCER ACTIONS
// =============================================================

export type Action =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_FUZZY_ANSWER'; dim: DimensionKey; idx: number; value: number }
  | { type: 'SET_JUSTIFICATIVA'; dim: DimensionKey; texto: string }
  | {
      type: 'SET_TRIAGEM_RESULT';
      result: FuzzyResult;
      blocked: boolean;
      gateThreshold: number;
    }
  | { type: 'RESET_TRIAGEM' }
  | {
      type: 'SET_FIELD';
      section: 'identificacao' | 'experiencia' | 'resultados' | 'materiais';
      field: string;
      value: string;
    }
  | {
      type: 'TOGGLE_CLASSIFICATION';
      key:
        | 'odsIds'
        | 'finalidadeSocialCodigos'
        | 'forproexCodigos'
        | 'publicoAlvoCodigos'
        | 'tipoSolucaoCodigos'
        | 'arranjoCodigos'
        | 'cnpqSubareaCodigos';
      value: string | number;
    }
  | {
      type: 'SET_CLASSIFICATION';
      key: 'cnpqGrandeAreaNome' | 'categoriaEditorialNome';
      value: string;
    }
  | { type: 'SET_MACROAREA_PRINCIPAL'; codigo: string | null }
  | { type: 'TOGGLE_MACROAREA_SECUNDARIA'; codigo: string }
  | { type: 'SET_TERMO'; aceito: boolean }
  | { type: 'SET_ARQUIVO'; slot: ArquivoSlot; file: File | null }
  | { type: 'SET_SUBMITTING'; submitting: boolean }
  | { type: 'SET_PROTOCOL'; protocolo: string }
  | { type: 'SET_SUBMIT_ERROR'; error: string | null }
  | { type: 'HYDRATE'; state: Partial<CadastroState> }
  | { type: 'RESET' };

export function reducer(state: CadastroState, action: Action): CadastroState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };

    case 'SET_FUZZY_ANSWER': {
      const current = state.fuzzyAnswers[action.dim];
      const next: [number, number, number, number] = [...current];
      next[action.idx] = action.value;
      return {
        ...state,
        fuzzyAnswers: { ...state.fuzzyAnswers, [action.dim]: next }
      };
    }

    case 'SET_JUSTIFICATIVA':
      return {
        ...state,
        justificativas: { ...state.justificativas, [action.dim]: action.texto }
      };

    case 'SET_TRIAGEM_RESULT':
      return {
        ...state,
        triagemResult: action.result,
        triagemBlocked: action.blocked,
        gateThreshold: action.gateThreshold
      };

    case 'RESET_TRIAGEM':
      return {
        ...state,
        fuzzyAnswers: INITIAL_FUZZY_ANSWERS,
        triagemResult: null,
        triagemBlocked: false,
        currentStep: STEPS.TRIAGEM_P
      };

    case 'SET_FIELD':
      return {
        ...state,
        [action.section]: {
          ...state[action.section],
          [action.field]: action.value
        }
      };

    case 'TOGGLE_CLASSIFICATION': {
      const list = state.classificacoes[action.key] as Array<string | number>;
      const has = list.includes(action.value);
      const next = has
        ? list.filter((v) => v !== action.value)
        : [...list, action.value];
      return {
        ...state,
        classificacoes: { ...state.classificacoes, [action.key]: next }
      };
    }

    case 'SET_CLASSIFICATION':
      return {
        ...state,
        classificacoes: {
          ...state.classificacoes,
          [action.key]: action.value
        }
      };

    case 'SET_MACROAREA_PRINCIPAL': {
      // Ao trocar a principal, remove a nova principal das secundárias caso estivesse lá
      const codigo = action.codigo;
      const existing = state.classificacoes.macroareasSecundariasCodigos ?? [];
      const secundarias = codigo
        ? existing.filter((c) => c !== codigo)
        : existing;
      return {
        ...state,
        classificacoes: {
          ...state.classificacoes,
          macroareaPrincipalCodigo: codigo,
          macroareasSecundariasCodigos: secundarias
        }
      };
    }

    case 'TOGGLE_MACROAREA_SECUNDARIA': {
      const { codigo } = action;
      const current = state.classificacoes.macroareasSecundariasCodigos ?? [];
      if (current.includes(codigo)) {
        return {
          ...state,
          classificacoes: {
            ...state.classificacoes,
            macroareasSecundariasCodigos: current.filter((c) => c !== codigo)
          }
        };
      }
      // Máximo 2 secundárias
      if (current.length >= 2) return state;
      // Não permite selecionar a principal como secundária
      if (codigo === state.classificacoes.macroareaPrincipalCodigo) return state;
      return {
        ...state,
        classificacoes: {
          ...state.classificacoes,
          macroareasSecundariasCodigos: [...current, codigo]
        }
      };
    }

    case 'SET_TERMO':
      return { ...state, termoAceito: action.aceito };

    case 'SET_ARQUIVO':
      return {
        ...state,
        arquivos: { ...state.arquivos, [action.slot]: action.file }
      };

    case 'SET_SUBMITTING':
      return { ...state, submitting: action.submitting };

    case 'SET_PROTOCOL':
      return { ...state, protocolo: action.protocolo, submitError: null };

    case 'SET_SUBMIT_ERROR':
      return { ...state, submitError: action.error, submitting: false };

    case 'HYDRATE':
      return { ...state, ...action.state };

    case 'RESET':
      return INITIAL_STATE;

    default:
      return state;
  }
}
