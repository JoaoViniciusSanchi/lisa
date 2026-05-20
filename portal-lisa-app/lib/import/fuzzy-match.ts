// Distância Levenshtein entre duas strings (case-insensitive, normalizado)
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/** Normaliza string removendo extensão, acentos, pontuação e espaços extras */
function normalize(s: string): string {
  return s
    .replace(/\.[^.]+$/, '') // remove extensão
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calcula similaridade [0, 1] entre dois strings.
 * 1.0 = idêntico, 0.0 = completamente diferente.
 */
export function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.length === 0 || nb.length === 0) return 0;
  const dist = levenshtein(na, nb);
  return 1 - dist / Math.max(na.length, nb.length);
}

export interface SuggestedMatch {
  csvRowIndex: number;
  docxFileIndex: number;
  score: number;
}

/**
 * Para cada arquivo .docx, sugere o índice da linha CSV mais similar.
 * Retorna apenas matches com score >= threshold.
 */
export function suggestMatches(
  csvTitles: string[],
  docxNames: string[],
  threshold = 0.5
): SuggestedMatch[] {
  const results: SuggestedMatch[] = [];

  for (let di = 0; di < docxNames.length; di++) {
    let bestScore = threshold;
    let bestCsvIdx = -1;

    for (let ci = 0; ci < csvTitles.length; ci++) {
      const score = similarity(docxNames[di], csvTitles[ci]);
      if (score > bestScore) {
        bestScore = score;
        bestCsvIdx = ci;
      }
    }

    if (bestCsvIdx >= 0) {
      results.push({ csvRowIndex: bestCsvIdx, docxFileIndex: di, score: bestScore });
    }
  }

  return results;
}
