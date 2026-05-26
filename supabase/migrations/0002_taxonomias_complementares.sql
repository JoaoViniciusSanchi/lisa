-- =============================================================
-- PORTAL LISA — MIGRATION 0002
-- Taxonomias complementares + Snapshot do formulário
-- =============================================================
-- Pré-requisito: lisa_setup.sql já executado.
-- Para rodar: SQL Editor do Supabase → cole este arquivo → Run.
-- =============================================================
-- Adiciona:
--   - 5 novas tabelas de taxonomia + 5 N:N com experiencia
--   - 1 tabela de snapshot do formulário (submissao_formulario)
--   - Seeds das 5 taxonomias com os valores do mockup de cadastro
-- =============================================================

BEGIN;

-- =============================================================
-- 1. NOVAS TAXONOMIAS PARALELAS
-- =============================================================

-- 1.1 Finalidade Social
-- Eixo paralelo às 9 categorias editoriais existentes (decisão Opção C:
-- taxonomias paralelas, NÃO hierárquicas). Uma experiência pode ter
-- categoria_editorial(s) E finalidade_social(s) marcadas independentemente.
-- 7 entradas correspondem à etapa 04 do mockup de cadastro.

CREATE TABLE finalidade_social (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo varchar(20) UNIQUE NOT NULL,
  nome varchar(100) NOT NULL,
  descricao text,
  ordem integer DEFAULT 0,
  ativa boolean DEFAULT true,
  criada_em timestamp DEFAULT now()
);

CREATE TABLE experiencia_finalidade_social (
  experiencia_id uuid REFERENCES experiencia(id) ON DELETE CASCADE,
  finalidade_id uuid REFERENCES finalidade_social(id),
  principal boolean DEFAULT false,
  PRIMARY KEY (experiencia_id, finalidade_id)
);

CREATE INDEX idx_exp_finalidade ON experiencia_finalidade_social(experiencia_id);

-- 1.2 Público-Alvo
CREATE TABLE publico_alvo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo varchar(20) UNIQUE NOT NULL,
  nome varchar(100) NOT NULL,
  descricao text,
  ordem integer DEFAULT 0,
  ativo boolean DEFAULT true,
  criado_em timestamp DEFAULT now()
);

CREATE TABLE experiencia_publico_alvo (
  experiencia_id uuid REFERENCES experiencia(id) ON DELETE CASCADE,
  publico_alvo_id uuid REFERENCES publico_alvo(id),
  PRIMARY KEY (experiencia_id, publico_alvo_id)
);

CREATE INDEX idx_exp_publico_alvo ON experiencia_publico_alvo(experiencia_id);

-- 1.3 Tipo de Solução Tecnológica
CREATE TABLE tipo_solucao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo varchar(20) UNIQUE NOT NULL,
  nome varchar(150) NOT NULL,
  descricao text,
  ordem integer DEFAULT 0,
  ativo boolean DEFAULT true,
  criado_em timestamp DEFAULT now()
);

CREATE TABLE experiencia_tipo_solucao (
  experiencia_id uuid REFERENCES experiencia(id) ON DELETE CASCADE,
  tipo_solucao_id uuid REFERENCES tipo_solucao(id),
  PRIMARY KEY (experiencia_id, tipo_solucao_id)
);

CREATE INDEX idx_exp_tipo_solucao ON experiencia_tipo_solucao(experiencia_id);

-- 1.4 Arranjo Institucional
CREATE TABLE arranjo_institucional (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo varchar(20) UNIQUE NOT NULL,
  nome varchar(150) NOT NULL,
  descricao text,
  ordem integer DEFAULT 0,
  ativo boolean DEFAULT true,
  criado_em timestamp DEFAULT now()
);

CREATE TABLE experiencia_arranjo (
  experiencia_id uuid REFERENCES experiencia(id) ON DELETE CASCADE,
  arranjo_id uuid REFERENCES arranjo_institucional(id),
  PRIMARY KEY (experiencia_id, arranjo_id)
);

CREATE INDEX idx_exp_arranjo ON experiencia_arranjo(experiencia_id);

-- 1.5 Base Teórica / Abordagem
-- Campo opcional no mockup — sem obrigatoriedade de pelo menos uma seleção.
CREATE TABLE base_teorica (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo varchar(20) UNIQUE NOT NULL,
  nome varchar(150) NOT NULL,
  descricao text,
  ordem integer DEFAULT 0,
  ativa boolean DEFAULT true,
  criada_em timestamp DEFAULT now()
);

CREATE TABLE experiencia_base_teorica (
  experiencia_id uuid REFERENCES experiencia(id) ON DELETE CASCADE,
  base_id uuid REFERENCES base_teorica(id),
  PRIMARY KEY (experiencia_id, base_id)
);

CREATE INDEX idx_exp_base_teorica ON experiencia_base_teorica(experiencia_id);

-- =============================================================
-- 2. SUBMISSÃO COMPLETA DO FORMULÁRIO (SNAPSHOT JSONB)
-- =============================================================
-- Armazena o payload integral de cada submissão (todas as respostas,
-- inclusive 20 valores fuzzy, justificativas, classificações, anexos)
-- + o resultado calculado pelo motor fuzzy (índices e pertinências).
-- Atrelado 1:1 à experiência criada — uma submissão = uma experiência.
-- Imutável após inserção: serve como auditoria do que o coordenador
-- de fato submeteu, separado da edição editorial feita pelos admins.
-- =============================================================

CREATE TABLE submissao_formulario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id uuid UNIQUE NOT NULL REFERENCES experiencia(id) ON DELETE CASCADE,

  -- Identificador legível mostrado na tela de sucesso (ex: "LISA-2026-0128")
  protocolo varchar(20) UNIQUE NOT NULL,

  -- Payload integral do formulário enviado pelo coordenador.
  -- Estrutura esperada (documentação informal):
  --   {
  --     "identificacao": { coordenador, vice, contatos },
  --     "experiencia":   { titulo, historico, metodologia, datas, local },
  --     "classificacoes": {
  --       "cnpq": [ids], "ods": [ids], "categoria_editorial": id,
  --       "finalidade_social": [ids], "forproex": [ids],
  --       "publico_alvo": [ids], "tipo_solucao": [ids],
  --       "arranjo": [ids], "base_teorica": [ids]
  --     },
  --     "fuzzy": {
  --       "respostas": { "P1": 8, "P2": 7, ..., "R4": 6 },
  --       "justificativas": { "P": "...", "I": "...", ... }
  --     },
  --     "resultados": { resultados_impactos, desafios_perspectivas, ... },
  --     "materiais":  { capa, secundaria_1, secundaria_2, links, redes }
  --   }
  respostas_brutas jsonb NOT NULL,

  -- Resultado calculado pelo motor fuzzy no servidor:
  --   {
  --     "medias":        { "P": 8.0, "I": 7.0, "A": 6.0, "S": 5.0, "R": 6.0 },
  --     "pertinencias":  { "P": {"baixo":0,"medio":0,"alto":0.5}, ... },
  --     "ativacoes":     { "baixo": 0, "medio": 0.5, "alto": 0.25 },
  --     "indice_fuzzy":  0.63,
  --     "indice_linear": 0.67,
  --     "faixa":         "amarelo"
  --   }
  triagem_resultado jsonb NOT NULL,

  -- Metadados de auditoria
  versao_motor_fuzzy varchar(20) DEFAULT '2.0-fuzzy',
  ip_origem varchar(45),
  user_agent varchar(500),
  submetido_em timestamp DEFAULT now()
);

CREATE INDEX idx_submissao_protocolo ON submissao_formulario(protocolo);
CREATE INDEX idx_submissao_experiencia ON submissao_formulario(experiencia_id);
CREATE INDEX idx_submissao_data ON submissao_formulario(submetido_em);

-- =============================================================
-- 3. SEEDS
-- =============================================================

-- 3.1 Finalidade Social — 7 entradas (etapa 04 do mockup de cadastro)
INSERT INTO finalidade_social (codigo, nome, descricao, ordem) VALUES
  ('ISP', 'Inclusão Socioprodutiva',           'Geração de renda, cooperativismo, economia solidária', 1),
  ('EDU', 'Educação e Formação',               'Metodologias pedagógicas, inclusão educacional, extensão', 2),
  ('SAU', 'Saúde e Bem-estar',                 'Promoção da saúde, prevenção, tecnologias comunitárias', 3),
  ('HAB', 'Habitação e Infraestrutura',        'Moradia, saneamento, urbanismo social', 4),
  ('AMB', 'Meio Ambiente e Sustentabilidade',  'Agroecologia, resíduos, energia social', 5),
  ('DH',  'Direitos Humanos e Cidadania',      'Acesso à justiça, participação social', 6),
  ('CUL', 'Cultura e Identidade',              'Patrimônio, expressões culturais, memória social', 7);

-- 3.2 Público-Alvo — 7 entradas (etapa 06 do mockup)
INSERT INTO publico_alvo (codigo, nome, ordem) VALUES
  ('CUP', 'Comunidades urbanas periféricas', 1),
  ('RUR', 'População rural',                 2),
  ('PVT', 'Povos tradicionais',              3),
  ('MUL', 'Mulheres',                        4),
  ('JUV', 'Juventude',                       5),
  ('IDO', 'Idosos',                          6),
  ('PCD', 'Pessoas com deficiência',         7);

-- 3.3 Tipo de Solução Tecnológica — 5 entradas (etapa 06)
INSERT INTO tipo_solucao (codigo, nome, descricao, ordem) VALUES
  ('PROC', 'Tecnologias de Processo',                            'Métodos, metodologias, arranjos organizacionais', 1),
  ('PROD', 'Tecnologias de Produto',                             'Artefatos físicos (ex.: filtros, equipamentos de baixo custo)', 2),
  ('DIG',  'Tecnologias Digitais',                               'Apps, plataformas, sistemas de informação', 3),
  ('HIB',  'Tecnologias Sociais Híbridas',                       'Combinação de digital + comunitário', 4),
  ('TRAD', 'Tecnologias Baseadas em Conhecimento Tradicional',   'Saberes locais, práticas ancestrais', 5);

-- 3.4 Arranjo Institucional — 6 entradas (etapa 06)
INSERT INTO arranjo_institucional (codigo, nome, ordem) VALUES
  ('EXT',  'Projeto de Extensão',                            1),
  ('PESQ', 'Pesquisa aplicada',                              2),
  ('ENS',  'Ensino (disciplinas/projetos integradores)',     3),
  ('GOV',  'Parcerias com governo',                          4),
  ('ONG',  'Parcerias com ONGs/comunidades',                 5),
  ('INCB', 'Incubadoras e laboratórios sociais',             6);

-- 3.5 Base Teórica — 6 entradas (etapa 06, opcional)
INSERT INTO base_teorica (codigo, nome, ordem) VALUES
  ('IS',  'Inovação Social',                          1),
  ('ES',  'Economia Solidária',                       2),
  ('DT',  'Desenvolvimento Territorial',              3),
  ('TA',  'Tecnologia Apropriada',                    4),
  ('CTS', 'Ciência, Tecnologia e Sociedade (CTS)',    5),
  ('TDI', 'Transformação Digital Inclusiva',          6);

COMMIT;

-- =============================================================
-- 4. VERIFICAÇÕES (rodar manualmente após o COMMIT)
-- =============================================================
--   SELECT COUNT(*) FROM finalidade_social;        -- esperado: 7
--   SELECT COUNT(*) FROM publico_alvo;             -- esperado: 7
--   SELECT COUNT(*) FROM tipo_solucao;             -- esperado: 5
--   SELECT COUNT(*) FROM arranjo_institucional;    -- esperado: 6
--   SELECT COUNT(*) FROM base_teorica;             -- esperado: 6
--   SELECT COUNT(*) FROM submissao_formulario;     -- esperado: 0
-- =============================================================
