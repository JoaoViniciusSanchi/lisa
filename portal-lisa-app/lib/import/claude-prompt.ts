import { createBrowserSupabase } from '@/lib/supabase/client';
import type { DocxExtracted, FieldMapping, CsvRow, ExperienciaImport, ClaudeAnalysisResponse } from './types';
import { calcFuzzyIndex } from '@/lib/fuzzy/engine';
import { DEFAULT_FUZZY_CONFIG, DIMENSIONS } from '@/lib/fuzzy/types';
import type { FuzzyAnswers, DimensionKey } from '@/lib/fuzzy/types';
import { generateSlug } from '@/lib/utils/slug';

// =============================================================
// Busca taxonomias do banco para incluir no prompt
// =============================================================

export interface TaxonomyData {
  categorias_editoriais: string[];
  macroareas: Array<{ codigo: string; nome: string }>;
  subareas_cnpq: Array<{ codigo: string; nome: string; grande_area: string }>;
  ods: Array<{ id: number; nome: string }>;
  forproex: Array<{ codigo: string; nome: string; descricao: string }>;
  finalidades_sociais: Array<{ codigo: string; nome: string }>;
  publico_alvo: Array<{ codigo: string; nome: string }>;
  tipos_solucao: Array<{ codigo: string; nome: string }>;
  arranjos: Array<{ codigo: string; nome: string }>;
  perguntas_fuzzy: Array<{ codigo: string; dimensao: string; texto: string }>;
}

export async function loadTaxonomyData(): Promise<TaxonomyData> {
  const sb = createBrowserSupabase();

  const [
    catRes,
    macRes,
    cnpqRes,
    grandeAreaRes,
    odsRes,
    forproexRes,
    finalidadeRes,
    publicoRes,
    tipoRes,
    arranjoRes,
    perguntaRes,
  ] = await Promise.all([
    sb.from('categoria_editorial').select('nome').order('nome'),
    sb.from('macroarea_ts').select('codigo, nome').order('nome'),
    sb.from('subarea_cnpq').select('codigo, nome, grande_area_id').order('codigo'),
    sb.from('grande_area_cnpq').select('id, nome'),
    sb.from('ods').select('id, nome').order('id'),
    sb.from('area_tematica_forproex').select('codigo, nome, descricao').eq('ativa', true).order('codigo'),
    sb.from('finalidade_social').select('codigo, nome').eq('ativa', true).order('nome'),
    sb.from('publico_alvo').select('codigo, nome').eq('ativo', true).order('nome'),
    sb.from('tipo_solucao').select('codigo, nome').eq('ativo', true).order('nome'),
    sb.from('arranjo_institucional').select('codigo, nome').eq('ativo', true).order('nome'),
    sb.from('pergunta_fuzzy').select('codigo, dimensao, texto_pergunta').eq('ativa', true).order('codigo'),
  ]);

  const gaMap = new Map<string, string>();
  for (const ga of grandeAreaRes.data ?? []) {
    gaMap.set(ga.id, ga.nome);
  }

  return {
    categorias_editoriais: (catRes.data ?? []).map((r) => r.nome),
    macroareas: (macRes.data ?? []).map((r) => ({ codigo: r.codigo, nome: r.nome })),
    subareas_cnpq: (cnpqRes.data ?? []).map((r) => ({
      codigo: r.codigo,
      nome: r.nome,
      grande_area: gaMap.get(r.grande_area_id as string) ?? ''
    })),
    ods: (odsRes.data ?? []).map((r) => ({ id: r.id as number, nome: r.nome })),
    forproex: (forproexRes.data ?? []).map((r) => ({
      codigo: r.codigo,
      nome: r.nome,
      descricao: r.descricao ?? ''
    })),
    finalidades_sociais: (finalidadeRes.data ?? []).map((r) => ({
      codigo: r.codigo,
      nome: r.nome
    })),
    publico_alvo: (publicoRes.data ?? []).map((r) => ({ codigo: r.codigo, nome: r.nome })),
    tipos_solucao: (tipoRes.data ?? []).map((r) => ({ codigo: r.codigo, nome: r.nome })),
    arranjos: (arranjoRes.data ?? []).map((r) => ({ codigo: r.codigo, nome: r.nome })),
    perguntas_fuzzy: (perguntaRes.data ?? []).map((r) => ({
      codigo: r.codigo,
      dimensao: r.dimensao,
      texto: r.texto_pergunta
    }))
  };
}

// =============================================================
// Monta os dados estruturados da experiência (campos mapeados + .docx)
// =============================================================

export function buildExperienceData(
  csvRow: CsvRow,
  mapping: FieldMapping,
  docx?: DocxExtracted
): Record<string, string> {
  const data: Record<string, string> = {};

  for (const [col, field] of Object.entries(mapping)) {
    if (field === '(ignorar)' || field === '(ia)') continue;
    const val = csvRow[col]?.trim();
    if (val) data[field] = val;
  }

  // Dados do .docx sobrescrevem CSV para campos de texto longo
  if (docx) {
    const fields: Array<keyof Omit<DocxExtracted, 'raw_text'>> = [
      'historico',
      'metodologia',
      'resultados_impactos',
      'desafios_perspectivas'
    ];
    for (const f of fields) {
      const val = docx[f];
      if (val?.trim()) data[f] = val.trim();
    }
    // Se não houve seções detectadas, usa raw_text como historico
    if (!data['historico'] && docx.raw_text?.trim()) {
      data['historico'] = docx.raw_text.trim();
    }
  }

  return data;
}

// =============================================================
// Extrai contexto completo do CSV: pares pergunta + justificativa
// e demais campos com conteúdo textual relevante.
// Usado como contexto adicional para a IA gerar textos ricos.
// =============================================================

export function buildCsvContextText(csvRow: CsvRow): string {
  const headers = Object.keys(csvRow);
  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const lines: string[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    if (processed.has(h)) continue;

    const val = (csvRow[h] ?? '').trim();
    const hn = normalize(h);

    // Colunas de justificativa são tratadas junto com sua pergunta-pai
    if (/justif/.test(hn)) {
      processed.add(h);
      continue;
    }

    // Verifica se a coluna seguinte é uma justificativa para esta
    const nextH = i + 1 < headers.length ? headers[i + 1] : null;
    const nextIsJust = nextH ? /justif/.test(normalize(nextH)) : false;

    if (!val) {
      processed.add(h);
      continue;
    }

    if (nextH && nextIsJust) {
      // Par pergunta + justificativa
      const justVal = (csvRow[nextH] ?? '').trim();
      lines.push(`[${h}]`);
      lines.push(`Resposta: ${val}`);
      if (justVal) lines.push(`Justificativa: ${justVal}`);
      lines.push('');
      processed.add(h);
      processed.add(nextH);
      i++; // avança sobre a coluna de justificativa
    } else {
      // Campo simples com conteúdo
      if (val.length >= 3) {
        lines.push(`[${h}]`);
        lines.push(val);
        lines.push('');
      }
      processed.add(h);
    }
  }

  return lines.join('\n').trim();
}

// =============================================================
// Monta o prompt para a IA
// =============================================================

const CHAR_LIMITS = {
  resumo: 280,
  historico: 3000,
  metodologia: 3000,
  resultados_impactos: 3000,
  desafios_perspectivas: 3000
};

export function buildClaudePrompt(
  expData: Record<string, string>,
  csvContextText: string,
  taxonomy: TaxonomyData
): string {
  const taxoBlock = JSON.stringify({
    categorias_editoriais: taxonomy.categorias_editoriais,
    macroareas: taxonomy.macroareas,
    subareas_cnpq: taxonomy.subareas_cnpq.slice(0, 80),
    ods: taxonomy.ods,
    forproex: taxonomy.forproex,
    finalidades_sociais: taxonomy.finalidades_sociais,
    publico_alvo: taxonomy.publico_alvo,
    tipos_solucao: taxonomy.tipos_solucao,
    arranjos: taxonomy.arranjos
  }, null, 2);

  const perguntasBlock = taxonomy.perguntas_fuzzy
    .map((p) => `  ${p.codigo} [${p.dimensao}]: ${p.texto}`)
    .join('\n');

  const dataBlock = JSON.stringify(expData, null, 2);

  const hasDocx = !!(expData['historico'] || expData['metodologia'] ||
    expData['resultados_impactos'] || expData['desafios_perspectivas']);

  return `Você é um analista especialista em tecnologia social e extensão universitária da UFF.

Analise os dados de uma experiência de extensão universitária e retorne um JSON estruturado.

## DADOS ESTRUTURADOS (campos mapeados do CSV${hasDocx ? ' + texto extraído do .docx' : ''})
${dataBlock}

## RESPOSTAS COMPLETAS DO FORMULÁRIO CSV
Estas são TODAS as respostas ao formulário, incluindo perguntas EFITS e seus campos de justificativa.
Use-as como fonte primária para gerar os textos editoriais quando os dados estruturados forem escassos.
${csvContextText || '(nenhum dado adicional disponível)'}

## TAXONOMIAS DISPONÍVEIS
Use APENAS os valores presentes nesta lista para preencher os campos de classificação:
${taxoBlock}

## PERGUNTAS EFITS (Motor Fuzzy de Tecnologia Social)
Para cada pergunta, estime um valor de 0 a 10 (incrementos de 0.5) com base em TODOS os textos disponíveis.
Escala: 0 = totalmente ausente, 5 = parcialmente manifestado, 10 = plenamente manifestado.

${perguntasBlock}

## LIMITES DE CARACTERES
- resumo: máximo ${CHAR_LIMITS.resumo} caracteres (linguagem de catálogo público, clara e objetiva)
- historico, metodologia, resultados_impactos, desafios_perspectivas: máximo ${CHAR_LIMITS.historico} caracteres cada
- Se um texto fornecido ultrapassar o limite, RESUMA preservando dados quantitativos, datas e contexto central.

## INSTRUÇÕES PARA GERAÇÃO DE TEXTOS
1. Combine os DADOS ESTRUTURADOS com as RESPOSTAS COMPLETAS DO FORMULÁRIO para produzir textos ricos.
${hasDocx ? '2. O texto do .docx está nos campos estruturados — use-o como base e enriqueça com as justificativas do formulário.' : '2. Não há .docx: use as justificativas e respostas do formulário como única fonte narrativa.'}
3. Cada texto (historico, metodologia, resultados_impactos, desafios_perspectivas) deve ter ao menos 2–3 parágrafos substanciais.
4. Se não houver dados suficientes para gerar um campo com qualidade mínima, deixe-o como string vazia ("")
   E marque textos_insuficientes.{campo}: true — isso sinaliza ao revisor que o campo precisa ser preenchido manualmente.
5. Nunca invente dados quantitativos, nomes ou datas que não estejam nas fontes fornecidas.

## OUTRAS INSTRUÇÕES
6. Para campus_uff, use exatamente um de: "Niterói", "Volta Redonda", "Campos dos Goytacazes", "Santo Antônio de Pádua", "Rio das Ostras", "Externa à UFF". Se não souber, use "Niterói".
7. Para vinculo do coordenador, use exatamente um de: "docente", "tecnico_administrativo", "estudante_graduacao", "estudante_pos", "pesquisador_externo", "membro_comunidade", "representante_organizacao", "outro".
8. Para data_inicio e data_fim, use formato ISO "YYYY-MM-DD". Se o campo estiver vazio ou desconhecido, NÃO inclua a chave no JSON (não retorne null nem texto descritivo — simplesmente omita o campo).
9. Para is_perene: true se o projeto não tem data prevista de encerramento ou é de natureza contínua.
10. Para respostas_fuzzy, use APENAS os códigos listados acima (P1 a R4).
11. Para justificativas EFITS, escreva no máximo 1000 caracteres por dimensão (P, I, A, S, R). São opcionais.
12. Para macroareas e cnpq_subareas, inclua is_principal: true para a classificação principal.
13. Em _texts_resumidos, indique campos que foram resumidos e o número original de caracteres.

## FORMATO DE RESPOSTA
Responda APENAS com o JSON válido abaixo (sem markdown, sem texto antes ou depois):

{
  "titulo": "string",
  "resumo": "string (max 280 chars)",
  "historico": "string (max 3000 chars, ou '' se insuficiente)",
  "metodologia": "string (max 3000 chars, ou '' se insuficiente)",
  "resultados_impactos": "string (max 3000 chars, ou '' se insuficiente)",
  "desafios_perspectivas": "string (max 3000 chars, ou '' se insuficiente)",
  "textos_insuficientes": {
    "historico": false,
    "metodologia": false,
    "resultados_impactos": false,
    "desafios_perspectivas": false
  },
  "data_inicio": "YYYY-MM-DD ou omitir",
  "data_fim": "YYYY-MM-DD ou omitir",
  "is_perene": true,
  "campus_uff": "string",
  "municipio": "string",
  "uf": "RJ",
  "email_contato": "string",
  "instagram": "string ou omitir",
  "site_externo": "string ou omitir",
  "youtube": "string ou omitir",
  "facebook": "string ou omitir",
  "categoria_editorial": "nome exato da lista",
  "macroareas": [{"codigo": "string", "is_principal": true}],
  "cnpq_subareas": [{"codigo": "string", "is_principal": true}],
  "ods": [{"id": 1, "is_principal": true}],
  "forproex_codigos": ["string"],
  "finalidade_social_codigos": ["string"],
  "publico_alvo_codigos": ["string"],
  "tipo_solucao_codigos": ["string"],
  "arranjo_codigos": ["string"],
  "respostas_fuzzy": {"P1": 7.5, "P2": 6.0, "P3": 8.0, "P4": 7.0, "I1": 8.5, "I2": 7.0, "I3": 6.5, "I4": 8.0, "A1": 5.0, "A2": 4.5, "A3": 6.0, "A4": 5.5, "S1": 6.0, "S2": 5.5, "S3": 5.0, "S4": 6.5, "R1": 7.0, "R2": 6.5, "R3": 5.5, "R4": 6.0},
  "justificativas": {"P": "string", "I": "string", "A": "string", "S": "string", "R": "string"},
  "coordenador": {
    "nome": "string",
    "email": "string",
    "telefone": "string ou omitir",
    "lattes_url": "string ou omitir",
    "vinculo": "docente",
    "departamento": "string ou omitir"
  },
  "_texts_resumidos": {
    "historico": {"original_chars": 4200},
    "metodologia": null,
    "resultados_impactos": null,
    "desafios_perspectivas": null
  }
}`;
}

export async function analyzeExperience(params: {
  csvRow: CsvRow;
  csvRowIndex: number;
  mapping: FieldMapping;
  docxExtracted?: DocxExtracted;
  docxSource?: string;
}): Promise<ExperienciaImport> {
  const taxonomy = await loadTaxonomyData();
  const expData = buildExperienceData(params.csvRow, params.mapping, params.docxExtracted);
  const csvContextText = buildCsvContextText(params.csvRow);
  const prompt = buildClaudePrompt(expData, csvContextText, taxonomy);

  // Chama a API route para manter a chave Gemini exclusivamente no servidor
  const response = await fetch('/api/analyze-experience', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error ?? `HTTP ${response.status}`);
  }
  const { text } = await response.json();
  const parsed: ClaudeAnalysisResponse = JSON.parse(text);

  const rawFuzzy = parsed.respostas_fuzzy ?? {};
  const fuzzyAnswers: FuzzyAnswers = {} as FuzzyAnswers;
  for (const dim of DIMENSIONS) {
    fuzzyAnswers[dim] = [
      rawFuzzy[`${dim}1`] ?? 5,
      rawFuzzy[`${dim}2`] ?? 5,
      rawFuzzy[`${dim}3`] ?? 5,
      rawFuzzy[`${dim}4`] ?? 5,
    ];
  }

  const fuzzyResult = calcFuzzyIndex(fuzzyAnswers, DEFAULT_FUZZY_CONFIG);

  return {
    titulo: parsed.titulo ?? '',
    resumo: parsed.resumo ?? '',
    slug: generateSlug(parsed.titulo ?? ''),
    emailContato: parsed.email_contato ?? '',
    dataInicio: parsed.data_inicio,
    dataFim: parsed.data_fim,
    isPerene: parsed.is_perene ?? true,
    statusImportado: 'em_moderacao',
    campusUff: parsed.campus_uff ?? 'Niterói',
    municipio: parsed.municipio ?? 'Niterói',
    uf: parsed.uf ?? 'RJ',
    emailContatoPublico: parsed.email_contato,
    instagram: parsed.instagram,
    facebook: parsed.facebook,
    youtube: parsed.youtube,
    siteExterno: parsed.site_externo,
    categoriaEditorial: parsed.categoria_editorial,
    macroareas: (parsed.macroareas ?? []).map(m => ({ codigo: m.codigo, isPrincipal: m.is_principal })),
    cnpqSubareas: (parsed.cnpq_subareas ?? []).map(s => ({ codigo: s.codigo, isPrincipal: s.is_principal })),
    ods: (parsed.ods ?? []).map(o => ({ id: o.id, isPrincipal: o.is_principal })),
    forproexCodigos: parsed.forproex_codigos ?? [],
    finalidadeSocialCodigos: parsed.finalidade_social_codigos ?? [],
    publicoAlvoCodigos: parsed.publico_alvo_codigos ?? [],
    tipoSolucaoCodigos: parsed.tipo_solucao_codigos ?? [],
    arranjoCodigos: parsed.arranjo_codigos ?? [],
    historico: parsed.historico ?? '',
    metodologia: parsed.metodologia ?? '',
    resultadosImpactos: parsed.resultados_impactos ?? '',
    desafiosPerspectivas: parsed.desafios_perspectivas ?? '',
    historico_en: params.docxExtracted?.historico_en,
    metodologia_en: params.docxExtracted?.metodologia_en,
    resultados_impactos_en: params.docxExtracted?.resultados_impactos_en,
    desafios_perspectivas_en: params.docxExtracted?.desafios_perspectivas_en,
    coordenador: parsed.coordenador ?? { nome: '', email: '' },
    equipe: [],
    fuzzyAnswers,
    justificativas: parsed.justificativas ?? {},
    fuzzyResult,
    _meta: {
      csvRowIndex: params.csvRowIndex,
      docxSource: params.docxSource,
      textsResumidos: {
        historico: parsed._texts_resumidos?.historico ? { originalChars: parsed._texts_resumidos.historico.original_chars } : undefined,
        metodologia: parsed._texts_resumidos?.metodologia ? { originalChars: parsed._texts_resumidos.metodologia.original_chars } : undefined,
        resultadosImpactos: parsed._texts_resumidos?.resultados_impactos ? { originalChars: parsed._texts_resumidos.resultados_impactos.original_chars } : undefined,
        desafiosPerspectivas: parsed._texts_resumidos?.desafios_perspectivas ? { originalChars: parsed._texts_resumidos.desafios_perspectivas.original_chars } : undefined,
      },
      textos_insuficientes: parsed.textos_insuficientes,
      reviewStatus: 'pending',
    },
  };
}
