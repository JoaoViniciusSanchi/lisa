import mammoth from 'mammoth';
import type { DocxExtracted } from './types';

// Padrões de cabeçalhos comuns em documentos de projetos acadêmicos (PT)
const SECTION_PATTERNS_PT: Array<{ keys: RegExp[]; field: keyof Omit<DocxExtracted, 'raw_text' | 'categoria_editorial_hint' | 'ods_hint' | 'equipe_raw'> }> = [
  {
    keys: [
      /hist[oó]rico/i,
      /apresenta[cç][aã]o/i,
      /descri[cç][aã]o\s+do\s+projeto/i,
      /sobre\s+o\s+projeto/i,
      /introdu[cç][aã]o/i,
      /objetivos?\s+gerais?/i,
      /objetivo\s+geral/i,
    ],
    field: 'historico'
  },
  {
    keys: [
      /metodologia/i,
      /m[eé]todos?/i,
      /procedimentos?/i,
      /desenvolvimento/i,
      /como\s+funciona/i,
    ],
    field: 'metodologia'
  },
  {
    keys: [
      /resultados?/i,
      /impactos?/i,
      /resultados?\s+e\s+impactos?/i,
      /impactos?\s+sociais?/i,
      /conquistas?/i,
      /o\s+que\s+j[aá]\s+realizamos?/i,
    ],
    field: 'resultados_impactos'
  },
  {
    keys: [
      /desafios?/i,
      /perspectivas?/i,
      /desafios?\s+e\s+perspectivas?/i,
      /pr[oó]ximos?\s+passos?/i,
      /limita[cç][oõ]es?/i,
      /dificuldades?/i,
    ],
    field: 'desafios_perspectivas'
  }
];

// Padrões de cabeçalhos em inglês
const SECTION_PATTERNS_EN: Array<{ keys: RegExp[]; field: keyof Omit<DocxExtracted, 'raw_text' | 'categoria_editorial_hint' | 'ods_hint' | 'equipe_raw'> }> = [
  {
    keys: [/^history$/i, /^background$/i, /^introduction$/i],
    field: 'historico_en'
  },
  {
    keys: [/^methodology/i, /^methods?$/i, /^developed\s+actions$/i],
    field: 'metodologia_en'
  },
  {
    keys: [/^(social\s+)?impacts?$/i, /^results?$/i, /^replicability/i],
    field: 'resultados_impactos_en'
  },
  {
    keys: [/^challenges?$/i, /^perspectives?$/i, /^future\s+works?$/i],
    field: 'desafios_perspectivas_en'
  }
];

interface ParsedSection {
  field: keyof Omit<DocxExtracted, 'raw_text' | 'categoria_editorial_hint' | 'ods_hint' | 'equipe_raw'>;
  startIndex: number;
  text: string;
}

/**
 * Extrai texto de um arquivo .docx (Buffer), tentando identificar seções PT e EN.
 * Se houver uma seção "Versão em inglês", extrai os subsections EN separadamente.
 * Também tenta extrair metadados (Grupo, ODS, Equipe) se presentes no documento.
 */
export async function parseDocx(buffer: ArrayBuffer): Promise<DocxExtracted> {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const raw_text = result.value.trim();

  if (!raw_text) {
    return { raw_text, historico: '' };
  }

  // Divide em linhas para detectar cabeçalhos
  const lines = raw_text.split('\n');
  const extracted: DocxExtracted = { raw_text };

  // Extrai metadados: busca linhas como "Grupo: ..." ou "ODS: ..."
  for (const line of lines) {
    const grupoMatch = line.match(/^Grupo\s*:\s*(.+)$/i);
    if (grupoMatch) {
      extracted.categoria_editorial_hint = grupoMatch[1].trim();
    }
    const odsMatch = line.match(/^ODS\s*:\s*(.+)$/i);
    if (odsMatch) {
      extracted.ods_hint = odsMatch[1].trim();
    }
  }

  // Localiza a seção "Versão em inglês" para separar PT de EN
  let enSectionStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/vers[aã]o\s+em\s+ingl[eê]s/i.test(lines[i])) {
      enSectionStart = i;
      break;
    }
  }

  // Se houver seção EN, divide o documento em duas metades
  const ptLines = enSectionStart >= 0 ? lines.slice(0, enSectionStart) : lines;
  const enLines = enSectionStart >= 0 ? lines.slice(enSectionStart + 1) : [];

  // Processa seções PT
  const sectionsPt = parseSections(ptLines, SECTION_PATTERNS_PT);
  for (const section of sectionsPt) {
    const existing = extracted[section.field];
    extracted[section.field] = existing
      ? `${existing}\n\n${section.text}`
      : section.text;
  }

  // Se não achou seções PT, coloca tudo em historico
  if (sectionsPt.length === 0 && extracted.historico === undefined) {
    extracted.historico = ptLines.join('\n').trim();
  }

  // Processa seções EN (se existirem)
  if (enLines.length > 0) {
    const sectionsEn = parseSections(enLines, SECTION_PATTERNS_EN);
    for (const section of sectionsEn) {
      const existing = extracted[section.field];
      extracted[section.field] = existing
        ? `${existing}\n\n${section.text}`
        : section.text;
    }
  }

  return extracted;
}

/**
 * Parseia um array de linhas buscando cabeçalhos que correspondem aos padrões fornecidos.
 */
function parseSections(
  lines: string[],
  patterns: Array<{ keys: RegExp[]; field: any }>
): ParsedSection[] {
  const sections: ParsedSection[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    for (const pattern of patterns) {
      const isHeader = pattern.keys.some((re) => re.test(line));
      // Considera cabeçalho: linha curta (< 80 chars) que bate com padrão
      if (isHeader && line.length < 80) {
        sections.push({ field: pattern.field, startIndex: i, text: '' });
        break;
      }
    }
  }

  // Preenche o texto de cada seção (do índice da seção até o início da próxima)
  for (let si = 0; si < sections.length; si++) {
    const start = sections[si].startIndex + 1; // pula a linha do cabeçalho
    const end = si + 1 < sections.length ? sections[si + 1].startIndex : lines.length;
    sections[si].text = lines
      .slice(start, end)
      .join('\n')
      .trim();
  }

  return sections;
}
