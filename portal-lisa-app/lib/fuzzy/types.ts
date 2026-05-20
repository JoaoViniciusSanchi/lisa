import type { FaixaFuzzy } from '@/lib/supabase/types';

export type DimensionKey = 'P' | 'I' | 'A' | 'S' | 'R';

export const DIMENSIONS: DimensionKey[] = ['P', 'I', 'A', 'S', 'R'];

export const DIMENSION_DB_KEY: Record<
  DimensionKey,
  | 'participacao_comunitaria'
  | 'impacto_social'
  | 'apropriacao_tecnologica'
  | 'sustentabilidade'
  | 'replicabilidade'
> = {
  P: 'participacao_comunitaria',
  I: 'impacto_social',
  A: 'apropriacao_tecnologica',
  S: 'sustentabilidade',
  R: 'replicabilidade'
};

/** Respostas das 4 perguntas por dimensão, em escala 0-10 (passo 0.5). */
export type FuzzyAnswers = Record<DimensionKey, [number, number, number, number]>;

export interface FuzzyConfig {
  pesos: Record<DimensionKey, number>;
  faixaVermelhoMax: number;
  faixaAmareloMax: number;
  versaoMotor: string;
  gateTriagemMin: number;
}

export interface DimensionPertinencias {
  baixo: number;
  medio: number;
  alto: number;
}

export interface FuzzyResult {
  /** Médias por dimensão (0-10) */
  medias: Record<DimensionKey, number>;

  /** Pertinências fuzzy (baixo/medio/alto) por dimensão */
  pertinencias: Record<DimensionKey, DimensionPertinencias>;

  /** Ativações agregadas das regras por consequente */
  ativacoes: { baixo: number; medio: number; alto: number };

  /** Índice fuzzy (0-1) — saída do motor Mamdani */
  indice_fuzzy: number;

  /** Índice linear ponderado (0-1) — referência cruzada */
  indice_linear: number;

  /** Faixa cromática final */
  faixa: FaixaFuzzy;

  /** Versão do motor que produziu o resultado */
  versao_motor: string;
}

/** Pesos e thresholds padrão (fallback se config_sistema falhar) */
export const DEFAULT_FUZZY_CONFIG: FuzzyConfig = {
  pesos: { P: 0.3, I: 0.25, A: 0.2, S: 0.15, R: 0.1 },
  faixaVermelhoMax: 0.3,
  faixaAmareloMax: 0.7,
  versaoMotor: '2.0-fuzzy',
  gateTriagemMin: 0.3
};
