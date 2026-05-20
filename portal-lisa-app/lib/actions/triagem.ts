'use server';

import { calcFuzzyIndex } from '@/lib/fuzzy/engine';
import { loadFuzzyConfig } from '@/lib/fuzzy/config';
import type { FuzzyAnswers, FuzzyResult } from '@/lib/fuzzy/types';

export interface TriagemServerResponse {
  result: FuzzyResult;
  liberado: boolean;
  gateThreshold: number;
}

/**
 * Recalcula o índice fuzzy NO SERVIDOR (decisão 10) — cliente apenas
 * preview para feedback instantâneo. Antes de gravar qualquer coisa
 * no banco, este endpoint é chamado para confirmar resultado e gate.
 */
export async function runTriagem(
  answers: FuzzyAnswers
): Promise<TriagemServerResponse> {
  const config = await loadFuzzyConfig();
  const result = calcFuzzyIndex(answers, config);
  const liberado = result.indice_fuzzy >= config.gateTriagemMin;

  return {
    result,
    liberado,
    gateThreshold: config.gateTriagemMin
  };
}
