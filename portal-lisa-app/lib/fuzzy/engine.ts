import type {
  FuzzyAnswers,
  FuzzyConfig,
  FuzzyResult,
  DimensionKey,
  DimensionPertinencias
} from './types';
import { DIMENSIONS } from './types';

// =============================================================
// Funções de pertinência triangulares (sobrepostas)
// =============================================================
// μ_baixo:  pico em 0,  decresce até 4
// μ_medio:  começa em 3, pico em 5,  termina em 7
// μ_alto:   começa em 6, pico em 10
// Documentado em /docs/lisa_perguntas_score.md

function baixo(x: number): number {
  return Math.max(0, Math.min(1, (4 - x) / 4));
}

function medio(x: number): number {
  return Math.max(0, Math.min((x - 3) / 2, (7 - x) / 2));
}

function alto(x: number): number {
  return Math.max(0, Math.min(1, (x - 6) / 4));
}

function pertinenciasOf(x: number): DimensionPertinencias {
  return { baixo: baixo(x), medio: medio(x), alto: alto(x) };
}

// =============================================================
// Aplicação das regras Mamdani
// =============================================================

interface DimensionMembership {
  B: number;
  M: number;
  A: number;
}

function rules(
  P: DimensionMembership,
  I: DimensionMembership,
  A: DimensionMembership,
  S: DimensionMembership,
  R: DimensionMembership
) {
  const min = Math.min;
  const max = Math.max;

  // ===== Regras → Baixo =====
  const baixo_score = max(
    min(P.B, I.B), // núcleo crítico
    min(P.B, A.B),
    min(I.B, S.B),
    min(P.B, R.B),
    min(P.B, I.M), // dominância negativa
    min(I.B, P.M),
    min(A.B, I.M)
  );

  // ===== Regras → Médio =====
  const medio_score = max(
    min(P.M, I.M), // intermediárias
    min(P.M, I.A),
    min(P.A, I.M),
    min(I.A, P.B), // compensações
    min(P.A, A.M),
    min(S.A, R.B),
    min(R.A, S.B),
    min(A.B, P.A), // falha de apropriação
    min(A.B, I.A),
    min(P.M, A.M, S.M), // maturidade parcial
    min(I.A, A.M),
    min(P.A, S.M),
    min(P.A, I.A, A.B) // ajuste: evita falso positivo
  );

  // ===== Regras → Alto =====
  const alto_score = max(
    min(P.A, I.A, A.A), // núcleo forte
    min(P.A, I.A, S.A), // maturidade ampliada
    min(P.A, I.A, R.A),
    min(P.A, I.A, A.A, S.A), // rede completa
    min(P.A, I.A, A.A, R.A),
    min(P.A, I.A, A.M, S.M), // equilíbrio geral
    min(P.M, I.A, A.A), // robustez
    min(P.A, I.M, A.A)
  );

  return { baixo_score, medio_score, alto_score };
}

// =============================================================
// Motor principal
// =============================================================

export function calcFuzzyIndex(
  answers: FuzzyAnswers,
  config: FuzzyConfig
): FuzzyResult {
  // Médias por dimensão
  const medias: Record<DimensionKey, number> = {} as Record<DimensionKey, number>;
  const pertinencias: Record<DimensionKey, DimensionPertinencias> = {} as Record<
    DimensionKey,
    DimensionPertinencias
  >;

  for (const dim of DIMENSIONS) {
    const vals = answers[dim];
    const avg = (vals[0] + vals[1] + vals[2] + vals[3]) / 4;
    medias[dim] = avg;
    pertinencias[dim] = pertinenciasOf(avg);
  }

  // Pertinências em formato compacto para as regras
  const toMembership = (p: DimensionPertinencias): DimensionMembership => ({
    B: p.baixo,
    M: p.medio,
    A: p.alto
  });

  const { baixo_score, medio_score, alto_score } = rules(
    toMembership(pertinencias.P),
    toMembership(pertinencias.I),
    toMembership(pertinencias.A),
    toMembership(pertinencias.S),
    toMembership(pertinencias.R)
  );

  // Defuzzificação por média ponderada
  // Centroides aproximados: baixo=0.2, medio=0.5, alto=0.9
  const eps = 1e-6;
  const indice_fuzzy =
    (baixo_score * 0.2 + medio_score * 0.5 + alto_score * 0.9) /
    (baixo_score + medio_score + alto_score + eps);

  // Índice linear (referência cruzada)
  const { pesos } = config;
  const indice_linear =
    (medias.P * pesos.P +
      medias.I * pesos.I +
      medias.A * pesos.A +
      medias.S * pesos.S +
      medias.R * pesos.R) /
    10;

  // Classificação cromática
  const faixa =
    indice_fuzzy <= config.faixaVermelhoMax
      ? 'vermelho'
      : indice_fuzzy <= config.faixaAmareloMax
        ? 'amarelo'
        : 'verde';

  return {
    medias,
    pertinencias,
    ativacoes: { baixo: baixo_score, medio: medio_score, alto: alto_score },
    indice_fuzzy: round3(indice_fuzzy),
    indice_linear: round3(indice_linear),
    faixa,
    versao_motor: config.versaoMotor
  };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
