import type { FuzzyAnswers, FuzzyResult, DimensionKey } from '@/lib/fuzzy/types';

// =============================================================
// Tipos do wizard de importação
// =============================================================

/** Uma linha do CSV, colunas indexadas pelo nome detectado */
export type CsvRow = Record<string, string>;

/** Mapeamento de cada coluna CSV para um campo do LISA (ou ignorar/ia) */
export type FieldMapping = Record<string, LisaField | '(ignorar)' | '(ia)'>;

/** Campos do LISA que podem ser mapeados diretamente de uma coluna CSV */
export type LisaField =
  | 'titulo'
  | 'historico'
  | 'metodologia'
  | 'resultados_impactos'
  | 'desafios_perspectivas'
  | 'data_inicio'
  | 'data_fim'
  | 'campus_uff'
  | 'municipio'
  | 'uf'
  | 'email_contato'
  | 'coordenador_nome'
  | 'coordenador_email'
  | 'coordenador_telefone'
  | 'coordenador_lattes'
  | 'coordenador_vinculo'
  | 'coordenador_departamento'
  | 'equipe'
  | 'instagram'
  | 'site_externo'
  | 'youtube'
  | 'facebook';

/** Associação entre um arquivo .docx e um índice de linha CSV */
export interface DocxMatch {
  csvRowIndex: number;
  file: File;
}

/** Texto extraído de um .docx, dividido por seções quando possível */
export interface DocxExtracted {
  historico?: string;
  metodologia?: string;
  resultados_impactos?: string;
  desafios_perspectivas?: string;
  // Seções em inglês (detectadas a partir de "Versão em inglês")
  historico_en?: string;
  metodologia_en?: string;
  resultados_impactos_en?: string;
  desafios_perspectivas_en?: string;
  // Dicas de metadados extraídas do documento
  categoria_editorial_hint?: string;
  ods_hint?: string;
  equipe_raw?: string;
  raw_text: string;
}

/** Dados de um coordenador */
export interface Coordenador {
  nome: string;
  email: string;
  telefone?: string;
  lattes_url?: string;
  vinculo?: string;
  departamento?: string;
}

/** Status alvo para a experiência importada */
export type StatusImportado =
  | 'aprovada_ativa_em_andamento'
  | 'aprovada_ativa_perene'
  | 'aprovada_encerrada'
  | 'em_moderacao';

/** Metadados sobre resumo de texto pela IA */
export interface TextResumido {
  originalChars: number;
}

/** Membro da equipe extraído do CSV ou DOCX */
export interface MembroEquipe {
  nome: string;
  email?: string;
  vinculo?: string;
}

/** Uma experiência completamente estruturada, pronta para gerar SQL */
export interface ExperienciaImport {
  // Identificação
  titulo: string;
  resumo: string;         // max 280 chars
  slug: string;
  emailContato: string;

  // Datas e status
  dataInicio?: string;    // ISO date string (YYYY-MM-DD)
  dataFim?: string;       // ISO date string (YYYY-MM-DD)
  isPerene: boolean;
  statusImportado: StatusImportado;

  // Localização
  campusUff?: string;
  municipio?: string;
  uf?: string;

  // Contato público
  emailContatoPublico?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  siteExterno?: string;

  // Categoria editorial (por nome)
  categoriaEditorial?: string;

  // Macroareas TS
  macroareas: Array<{ codigo: string; isPrincipal: boolean }>;

  // CNPq
  cnpqSubareas: Array<{ codigo: string; isPrincipal: boolean }>;

  // ODS (por id inteiro 1-17)
  ods: Array<{ id: number; isPrincipal: boolean }>;

  // Outros (por código)
  forproexCodigos: string[];
  finalidadeSocialCodigos: string[];
  publicoAlvoCodigos: string[];
  tipoSolucaoCodigos: string[];
  arranjoCodigos: string[];

  // Textos longos (max 3000 chars cada)
  historico: string;
  metodologia: string;
  resultadosImpactos: string;
  desafiosPerspectivas: string;

  // Textos em inglês (quando extraídos de DOCX com seção "Versão em inglês")
  historico_en?: string;
  metodologia_en?: string;
  resultados_impactos_en?: string;
  desafios_perspectivas_en?: string;

  // Coordenador
  coordenador: Coordenador;

  // Equipe (membros além do coordenador)
  equipe: MembroEquipe[];

  // EFITS
  fuzzyAnswers: FuzzyAnswers;
  justificativas: Partial<Record<DimensionKey, string>>;
  fuzzyResult: FuzzyResult;

  /**
   * Indica se esta experiência faz parte do Catálogo de Tecnologias Sociais.
   * Definido globalmente no início do wizard de importação.
   * true = compõe catálogo TS (foi cadastrada durante um edital)
   * false = apenas catálogo interno LISA
   */
  catalogoTs: boolean;

  /**
   * Nome do edital ao qual esta importação está vinculada.
   * Só relevante quando catalogoTs = true.
   * Ex: "Chamamento 2026"
   */
  editalOrigem?: string | null;

  // Metadados de revisão
  _meta: {
    csvRowIndex: number;
    docxSource?: string;
    textsResumidos: {
      historico?: TextResumido;
      metodologia?: TextResumido;
      resultadosImpactos?: TextResumido;
      desafiosPerspectivas?: TextResumido;
    };
    textos_insuficientes?: {
      historico?: boolean;
      metodologia?: boolean;
      resultadosImpactos?: boolean;
      desafiosPerspectivas?: boolean;
    };
    reviewStatus: 'pending' | 'approved' | 'removed';
  };
}

// =============================================================
// Tipos de resposta da API de análise Claude
// =============================================================

/** JSON retornado pela API /import-analyze (antes do cálculo fuzzy) */
export interface ClaudeAnalysisResponse {
  titulo: string;
  resumo: string;
  historico: string;
  metodologia: string;
  resultados_impactos: string;
  desafios_perspectivas: string;
  data_inicio?: string;
  data_fim?: string;
  is_perene: boolean;
  campus_uff?: string;
  municipio?: string;
  uf?: string;
  email_contato?: string;
  instagram?: string;
  site_externo?: string;
  youtube?: string;
  facebook?: string;
  categoria_editorial?: string;
  macroareas: Array<{ codigo: string; is_principal: boolean }>;
  cnpq_subareas: Array<{ codigo: string; is_principal: boolean }>;
  ods: Array<{ id: number; is_principal: boolean }>;
  forproex_codigos: string[];
  finalidade_social_codigos: string[];
  publico_alvo_codigos: string[];
  tipo_solucao_codigos: string[];
  arranjo_codigos: string[];
  respostas_fuzzy: Record<string, number>;
  justificativas: Partial<Record<DimensionKey, string>>;
  textos_insuficientes?: {
    historico?: boolean;
    metodologia?: boolean;
    resultados_impactos?: boolean;
    desafios_perspectivas?: boolean;
  };
  coordenador: {
    nome: string;
    email: string;
    telefone?: string;
    lattes_url?: string;
    vinculo?: string;
    departamento?: string;
  };
  _texts_resumidos: {
    historico?: { original_chars: number };
    metodologia?: { original_chars: number };
    resultados_impactos?: { original_chars: number };
    desafios_perspectivas?: { original_chars: number };
  };
}

/** Resposta completa da API /import-analyze (inclui fuzzy calculado) */
export interface AnalyzeApiResponse {
  success: true;
  data: ExperienciaImport;
  error?: never;
}

export interface AnalyzeApiError {
  success: false;
  error: string;
  data?: never;
}

/** Resposta da API /import-extract-doc */
export interface ExtractDocResponse {
  success: boolean;
  extracted?: DocxExtracted;
  error?: string;
}

// =============================================================
// Tipos de estado do wizard
// =============================================================

export type WizardStep =
  | 'upload'
  | 'matching'
  | 'mapping'
  | 'analysis'
  | 'review'
  | 'sql';

export interface WizardState {
  step: WizardStep;
  csvRows: CsvRow[];
  csvHeaders: string[];
  docxFiles: File[];
  docxMatches: DocxMatch[];
  fieldMapping: FieldMapping;
  experiences: ExperienciaImport[];
  analysisProgress: { current: number; total: number; currentTitle: string };
  generatedSql: string;

  /**
   * Configuração global do lote:
   * Se esta importação pertence ao Catálogo de Tecnologias Sociais.
   * Aplica-se a todas as experiências do lote.
   */
  catalogoTs: boolean;
  /** Nome do edital ao qual este lote está vinculado (ex: "Chamamento 2026"). */
  editalOrigem: string;
}
