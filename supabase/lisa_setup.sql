-- =============================================================
-- PORTAL LISA - SETUP COMPLETO DO BANCO DE DADOS
-- =============================================================
-- Para rodar no Supabase:
-- 1. Acesse o painel do seu projeto Supabase
-- 2. Vá em "SQL Editor" no menu lateral
-- 3. Cole este arquivo inteiro e clique em "Run"
-- 4. Verifique no "Table Editor" se as tabelas foram criadas
-- =============================================================
-- Última atualização: abril 2026
-- Total: 21 tabelas, 4 views, 16 enums
-- =============================================================

-- Habilita extensão para gen_random_uuid() (já vem ativa no Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- 1. ENUMS
-- =============================================================

CREATE TYPE experiencia_status AS ENUM (
  'rascunho',
  'em_moderacao',
  'aprovada_ativa_em_andamento',
  'aprovada_ativa_perene',
  'aprovada_encerrada',
  'aguardando_confirmacao_coordenador',
  'inativa_nao_confirmada',
  'rejeitada'
);

CREATE TYPE pessoa_vinculo AS ENUM (
  'docente',
  'tecnico_administrativo',
  'estudante_graduacao',
  'estudante_pos',
  'pesquisador_externo',
  'membro_comunidade',
  'representante_organizacao',
  'outro'
);

CREATE TYPE papel_na_experiencia AS ENUM (
  'coordenador',
  'vice_coordenador',
  'membro_equipe',
  'representante_comunidade',
  'parceiro_externo'
);

CREATE TYPE versao_conteudo AS ENUM (
  'bruto',
  'em_revisao_editorial',
  'pt_pronto',
  'em_traducao',
  'publicavel',
  'publicado'
);

CREATE TYPE traducao_status AS ENUM (
  'pendente',
  'rascunho_api_gerado',
  'em_primeira_revisao',
  'primeira_revisao_concluida',
  'em_segunda_revisao',
  'publicavel',
  'publicada',
  'nao_aplicavel'
);

CREATE TYPE dimensao_fuzzy AS ENUM (
  'participacao_comunitaria',
  'impacto_social',
  'apropriacao_tecnologica',
  'sustentabilidade',
  'replicabilidade'
);

CREATE TYPE faixa_fuzzy AS ENUM (
  'vermelho',    -- 0.0 - 0.3 (não é tecnologia social)
  'amarelo',     -- 0.3 - 0.7 (potencial / em transição)
  'verde'        -- 0.7 - 1.0 (tecnologia social consolidada)
);

CREATE TYPE nivel_linguistico AS ENUM (
  'baixo',
  'medio',
  'alto'
);

CREATE TYPE anexo_tipo AS ENUM (
  'foto_capa',
  'foto_secundaria_1',
  'foto_secundaria_2',
  'foto_galeria_extra',
  'logo',
  'video',
  'documento_pdf',
  'publicacao_academica',
  'material_didatico',
  'reportagem_midia',
  'link_externo_outro'
);

CREATE TYPE anexo_origem AS ENUM (
  'supabase_storage',
  'link_externo'
);

CREATE TYPE email_tipo AS ENUM (
  'confirmacao_submissao',
  'notificacao_admin',
  'aprovacao',
  'rejeicao',
  'solicitacao_atualizacao',
  'lembrete_atualizacao',
  'notificacao_inativacao'
);

CREATE TYPE email_status AS ENUM (
  'pendente',
  'enviado',
  'entregue',
  'falhou',
  'bounced'
);

CREATE TYPE convite_resposta AS ENUM (
  'ainda_ativa_sem_alteracoes',
  'ainda_ativa_com_atualizacoes',
  'encerrada',
  'nao_respondido'
);

CREATE TYPE admin_nivel AS ENUM (
  'super_admin',
  'moderador',
  'revisor_traducao',
  'visualizador'
);

CREATE TYPE log_acao AS ENUM (
  'visualizou_experiencia',
  'abriu_para_moderacao',
  'aprovou_experiencia',
  'rejeitou_experiencia',
  'editou_conteudo_pt',
  'editou_conteudo_en',
  'regenerou_traducao_api',
  'aprovou_traducao_primeira_revisao',
  'aprovou_traducao_segunda_revisao',
  'publicou_no_catalogo',
  'despublicou_do_catalogo',
  'enviou_solicitacao_atualizacao',
  'marcou_como_inativa',
  'reativou_experiencia',
  'adicionou_nota_editorial',
  'alterou_categorizacao',
  'recalculou_score',
  'ajustou_pesos_pergunta',
  'exportou_dados',
  'acessou_painel'
);

CREATE TYPE config_categoria AS ENUM (
  'conteudo_publico',
  'templates_email',
  'edital',
  'scoring',
  'integracao',
  'feature_flag',
  'legal'
);

-- =============================================================
-- 2. TABELAS - ordem respeitando foreign keys
-- =============================================================

-- ----- Taxonomias (sem dependências) -----

CREATE TABLE grande_area_cnpq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo varchar(20) UNIQUE NOT NULL,
  nome varchar(200) NOT NULL,
  ordem integer
);

CREATE TABLE subarea_cnpq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grande_area_id uuid NOT NULL REFERENCES grande_area_cnpq(id),
  codigo varchar(20) UNIQUE NOT NULL,
  nome varchar(300) NOT NULL,
  nivel integer,
  parent_id uuid REFERENCES subarea_cnpq(id)
);

CREATE TABLE categoria_editorial (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(200) UNIQUE NOT NULL,
  descricao text,
  ordem integer,
  ativa boolean DEFAULT true
);

CREATE TABLE ods (
  id integer PRIMARY KEY,
  nome varchar(200) NOT NULL,
  descricao text,
  cor_hex varchar(7),
  icone_url varchar(500)
);

-- ----- Admin (depende de auth.users do Supabase) -----

CREATE TABLE admin_perfil (
  id uuid PRIMARY KEY,  -- vincular manualmente ao auth.users.id após criar usuário
  nome_completo varchar(200) NOT NULL,
  cargo varchar(200),
  email_institucional varchar(255) UNIQUE NOT NULL,
  nivel_acesso admin_nivel NOT NULL DEFAULT 'moderador',
  ultimo_acesso_em timestamp,
  ativo boolean DEFAULT true,
  criado_em timestamp DEFAULT now(),
  atualizado_em timestamp DEFAULT now()
);

-- Comentário: a FK para auth.users não é declarada formalmente pois auth é um schema
-- gerenciado pelo Supabase. A vinculação é feita por convenção: o UUID em admin_perfil.id
-- deve ser igual ao UUID em auth.users.id.

-- ----- Pessoas -----

CREATE TABLE pessoa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo varchar(200) NOT NULL,
  email varchar(255) UNIQUE NOT NULL,
  vinculo pessoa_vinculo,
  instituicao varchar(200),
  departamento varchar(200),
  lattes_url varchar(500),
  orcid varchar(50),
  telefone varchar(30),
  is_especialista boolean DEFAULT false,
  criada_em timestamp DEFAULT now(),
  atualizada_em timestamp DEFAULT now()
);

-- ----- Experiência (tabela central) -----

CREATE TABLE experiencia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo varchar(300) NOT NULL,
  slug varchar(350) UNIQUE,
  resumo text,
  data_inicio date,
  data_fim date,
  is_perene boolean DEFAULT false,
  status experiencia_status NOT NULL DEFAULT 'em_moderacao',
  campus_uff varchar(100),
  municipio varchar(100),
  uf char(2),
  categoria_editorial_id uuid REFERENCES categoria_editorial(id),
  -- Denormalização de acesso rápido para listagens e filtros.
  -- Atualizadas automaticamente quando uma nova avaliacao_fuzzy é calculada.
  indice_fuzzy numeric(4,3) DEFAULT 0,
  faixa_fuzzy_atual faixa_fuzzy,
  score_calculado_em timestamp,
  submetida_em timestamp DEFAULT now(),
  aprovada_em timestamp,
  ultima_atualizacao timestamp DEFAULT now(),
  email_contato varchar(255) NOT NULL
);

-- ----- Tabelas que dependem de experiencia -----

CREATE TABLE experiencia_pessoa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id uuid NOT NULL REFERENCES experiencia(id) ON DELETE CASCADE,
  pessoa_id uuid NOT NULL REFERENCES pessoa(id),
  papel papel_na_experiencia NOT NULL,
  ordem integer DEFAULT 0
);

CREATE TABLE experiencia_cnpq (
  experiencia_id uuid REFERENCES experiencia(id) ON DELETE CASCADE,
  subarea_id uuid REFERENCES subarea_cnpq(id),
  is_principal boolean DEFAULT false,
  PRIMARY KEY (experiencia_id, subarea_id)
);

CREATE TABLE experiencia_ods (
  experiencia_id uuid REFERENCES experiencia(id) ON DELETE CASCADE,
  ods_id integer REFERENCES ods(id),
  is_principal boolean DEFAULT false,
  PRIMARY KEY (experiencia_id, ods_id)
);

CREATE TABLE experiencia_conteudo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id uuid UNIQUE NOT NULL REFERENCES experiencia(id) ON DELETE CASCADE,
  email_contato_publico varchar(255),
  instagram varchar(100),
  facebook varchar(200),
  youtube varchar(200),
  site_externo varchar(500),
  outras_redes jsonb DEFAULT '[]'::jsonb,
  versao_atual versao_conteudo NOT NULL DEFAULT 'bruto',
  texto_bruto_snapshot jsonb,
  editado_por_admin_em timestamp,
  editado_por_admin_id uuid REFERENCES admin_perfil(id),
  notas_editoriais text,
  criado_em timestamp DEFAULT now(),
  atualizado_em timestamp DEFAULT now()
);

CREATE TABLE experiencia_traducao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id uuid NOT NULL REFERENCES experiencia(id) ON DELETE CASCADE,
  idioma char(2) NOT NULL,
  titulo varchar(300) NOT NULL,
  historico text,
  metodologia text,
  resultados_impactos text,
  desafios_perspectivas text,
  is_original boolean DEFAULT false,
  rascunho_api jsonb,
  status_por_campo jsonb DEFAULT '{"historico":"pendente","metodologia":"pendente","resultados_impactos":"pendente","desafios_perspectivas":"pendente"}'::jsonb,
  status_global traducao_status DEFAULT 'pendente',
  provedor_api varchar(50),
  api_chamada_em timestamp,
  primeira_revisao_em timestamp,
  primeira_revisao_por_id uuid REFERENCES admin_perfil(id),
  segunda_revisao_em timestamp,
  segunda_revisao_por_id uuid REFERENCES admin_perfil(id),
  publicada_em timestamp,
  criada_em timestamp DEFAULT now(),
  atualizada_em timestamp DEFAULT now(),
  UNIQUE (experiencia_id, idioma)
);

CREATE TABLE pergunta_fuzzy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo varchar(10) UNIQUE NOT NULL,  -- P1, P2, I1, A1, etc.
  dimensao dimensao_fuzzy NOT NULL,
  texto_pergunta text NOT NULL,
  texto_explicativo text,
  ordem integer NOT NULL,  -- ordem dentro da dimensão (1-4)
  ativa boolean DEFAULT true,
  criada_em timestamp DEFAULT now()
);

CREATE TABLE resposta_fuzzy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id uuid NOT NULL REFERENCES experiencia(id) ON DELETE CASCADE,
  pergunta_id uuid NOT NULL REFERENCES pergunta_fuzzy(id),
  -- Valor na escala contínua de 0 a 10, com passo de 0.5
  valor numeric(3,1) NOT NULL CHECK (valor >= 0 AND valor <= 10),
  respondida_em timestamp DEFAULT now(),
  UNIQUE (experiencia_id, pergunta_id)
);

CREATE TABLE justificativa_dimensao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id uuid NOT NULL REFERENCES experiencia(id) ON DELETE CASCADE,
  dimensao dimensao_fuzzy NOT NULL,
  texto text CHECK (char_length(texto) <= 1000),
  criada_em timestamp DEFAULT now(),
  UNIQUE (experiencia_id, dimensao)
);

CREATE TABLE avaliacao_fuzzy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id uuid NOT NULL REFERENCES experiencia(id) ON DELETE CASCADE,

  -- Médias por dimensão (calculadas a partir das 4 perguntas)
  media_participacao numeric(4,2),
  media_impacto numeric(4,2),
  media_apropriacao numeric(4,2),
  media_sustentabilidade numeric(4,2),
  media_replicabilidade numeric(4,2),

  -- Pertinências fuzzy por dimensão (baixo/médio/alto)
  -- Armazenadas como JSONB para simplicidade
  -- Formato: {"P": {"baixo": 0.0, "medio": 0.0, "alto": 0.5}, ...}
  pertinencias jsonb,

  -- Ativações das regras fuzzy (para auditoria)
  -- Formato: {"baixo_score": 0.0, "medio_score": 0.5, "alto_score": 0.25}
  ativacoes_fuzzy jsonb,

  -- Índice fuzzy final (0.0 a 1.0)
  indice_fuzzy numeric(4,3) NOT NULL CHECK (indice_fuzzy >= 0 AND indice_fuzzy <= 1),

  -- Índice linear (referência cruzada usando pesos das dimensões)
  indice_linear numeric(4,3) CHECK (indice_linear >= 0 AND indice_linear <= 1),

  -- Classificação cromática final
  faixa faixa_fuzzy NOT NULL,

  calculada_em timestamp DEFAULT now(),
  versao_motor varchar(20) DEFAULT '2.0-fuzzy'
);

CREATE TABLE anexo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id uuid NOT NULL REFERENCES experiencia(id) ON DELETE CASCADE,
  tipo anexo_tipo NOT NULL,
  origem anexo_origem NOT NULL,
  bucket varchar(100),
  caminho_storage varchar(500),
  url_externa varchar(1000),
  titulo varchar(300),
  descricao text,
  tamanho_bytes bigint,
  mime_type varchar(100),
  ordem integer DEFAULT 0,
  is_capa boolean DEFAULT false,
  criado_em timestamp DEFAULT now()
);

CREATE TABLE historico_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id uuid NOT NULL REFERENCES experiencia(id) ON DELETE CASCADE,
  status_anterior experiencia_status,
  status_novo experiencia_status NOT NULL,
  motivo text,
  alterado_por varchar(200),
  alterado_em timestamp DEFAULT now()
);

CREATE TABLE disparo_email (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id uuid REFERENCES experiencia(id) ON DELETE SET NULL,
  pessoa_id uuid REFERENCES pessoa(id),
  tipo email_tipo NOT NULL,
  destinatario varchar(255) NOT NULL,
  assunto varchar(500),
  corpo_html text,
  status email_status NOT NULL DEFAULT 'pendente',
  enviado_em timestamp,
  erro_mensagem text,
  resend_id varchar(100),
  criado_em timestamp DEFAULT now()
);

CREATE TABLE convite_atualizacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id uuid NOT NULL REFERENCES experiencia(id) ON DELETE CASCADE,
  pessoa_id uuid NOT NULL REFERENCES pessoa(id),
  token varchar(64) UNIQUE NOT NULL,
  enviado_em timestamp DEFAULT now(),
  expira_em timestamp NOT NULL,
  respondido_em timestamp,
  resposta convite_resposta,
  observacoes_coordenador text
);

CREATE TABLE log_moderacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiencia_id uuid REFERENCES experiencia(id) ON DELETE SET NULL,
  admin_id uuid NOT NULL REFERENCES admin_perfil(id),
  acao log_acao NOT NULL,
  detalhes jsonb,
  ip_origem varchar(45),
  user_agent varchar(500),
  ocorrido_em timestamp DEFAULT now()
);

CREATE TABLE configuracao_sistema (
  chave varchar(100) PRIMARY KEY,
  valor jsonb NOT NULL,
  descricao text,
  categoria config_categoria NOT NULL,
  editavel_pelo_painel boolean DEFAULT true,
  atualizado_em timestamp DEFAULT now(),
  atualizado_por_id uuid REFERENCES admin_perfil(id)
);

-- =============================================================
-- 3. ÍNDICES
-- =============================================================

CREATE INDEX idx_experiencia_status ON experiencia(status);
CREATE INDEX idx_experiencia_categoria ON experiencia(categoria_editorial_id);
CREATE INDEX idx_experiencia_campus_status ON experiencia(campus_uff, status);
CREATE INDEX idx_experiencia_submetida ON experiencia(submetida_em);

CREATE INDEX idx_pessoa_email ON pessoa(email);
CREATE INDEX idx_pessoa_vinculo ON pessoa(vinculo);

CREATE INDEX idx_exp_pessoa_papel ON experiencia_pessoa(experiencia_id, papel);
CREATE INDEX idx_exp_pessoa_pessoa ON experiencia_pessoa(pessoa_id);

CREATE INDEX idx_subarea_grande_area ON subarea_cnpq(grande_area_id);
CREATE INDEX idx_subarea_parent ON subarea_cnpq(parent_id);

CREATE INDEX idx_traducao_experiencia ON experiencia_traducao(experiencia_id);
CREATE INDEX idx_traducao_status ON experiencia_traducao(status_global);

CREATE INDEX idx_resposta_fuzzy_experiencia ON resposta_fuzzy(experiencia_id);
CREATE INDEX idx_resposta_fuzzy_pergunta ON resposta_fuzzy(pergunta_id);
CREATE INDEX idx_justificativa_experiencia ON justificativa_dimensao(experiencia_id);
CREATE INDEX idx_avaliacao_fuzzy_experiencia ON avaliacao_fuzzy(experiencia_id, calculada_em);
CREATE INDEX idx_avaliacao_fuzzy_faixa ON avaliacao_fuzzy(faixa);

CREATE INDEX idx_anexo_experiencia ON anexo(experiencia_id);
CREATE INDEX idx_anexo_experiencia_tipo ON anexo(experiencia_id, tipo);

CREATE INDEX idx_historico_experiencia ON historico_status(experiencia_id);
CREATE INDEX idx_historico_data ON historico_status(alterado_em);

CREATE INDEX idx_email_experiencia ON disparo_email(experiencia_id);
CREATE INDEX idx_email_pessoa ON disparo_email(pessoa_id);
CREATE INDEX idx_email_status ON disparo_email(status);
CREATE INDEX idx_email_tipo ON disparo_email(tipo);

CREATE INDEX idx_convite_token ON convite_atualizacao(token);
CREATE INDEX idx_convite_experiencia ON convite_atualizacao(experiencia_id);
CREATE INDEX idx_convite_expira ON convite_atualizacao(expira_em);

CREATE INDEX idx_log_experiencia ON log_moderacao(experiencia_id);
CREATE INDEX idx_log_admin ON log_moderacao(admin_id);
CREATE INDEX idx_log_data ON log_moderacao(ocorrido_em);
CREATE INDEX idx_log_acao ON log_moderacao(acao);

-- =============================================================
-- 4. VIEWS
-- =============================================================

-- View: fila de moderação ordenada por score
CREATE OR REPLACE VIEW view_fila_moderacao AS
SELECT 
  e.id,
  e.titulo,
  e.submetida_em,
  e.email_contato,
  e.campus_uff,
  ce.nome AS categoria_editorial,
  COALESCE(av.indice_fuzzy, 0) AS indice_fuzzy,
  COALESCE(av.indice_linear, 0) AS indice_linear,
  av.faixa
FROM experiencia e
LEFT JOIN categoria_editorial ce ON e.categoria_editorial_id = ce.id
LEFT JOIN LATERAL (
  SELECT * FROM avaliacao_fuzzy
  WHERE experiencia_id = e.id
  ORDER BY calculada_em DESC
  LIMIT 1
) av ON true
WHERE e.status = 'em_moderacao'
ORDER BY av.indice_fuzzy DESC NULLS LAST, e.submetida_em ASC;

-- View: traduções pendentes
CREATE OR REPLACE VIEW view_traducoes_pendentes AS
SELECT 
  t.id AS traducao_id,
  t.experiencia_id,
  e.titulo AS titulo_pt,
  t.idioma,
  t.status_global,
  t.status_por_campo,
  t.criada_em,
  t.api_chamada_em,
  t.primeira_revisao_em
FROM experiencia_traducao t
JOIN experiencia e ON t.experiencia_id = e.id
WHERE t.status_global IN (
  'rascunho_api_gerado',
  'em_primeira_revisao',
  'primeira_revisao_concluida',
  'em_segunda_revisao'
)
ORDER BY t.criada_em ASC;

-- View: estatísticas do dashboard
CREATE OR REPLACE VIEW view_estatisticas_dashboard AS
SELECT 
  COUNT(*) FILTER (WHERE status::text LIKE 'aprovada%') AS total_aprovadas,
  COUNT(*) FILTER (WHERE status = 'em_moderacao') AS fila_moderacao,
  COUNT(*) FILTER (WHERE status = 'aguardando_confirmacao_coordenador') AS aguardando_resposta,
  COUNT(*) FILTER (WHERE status = 'inativa_nao_confirmada') AS inativas,
  COUNT(*) FILTER (WHERE status = 'rejeitada') AS rejeitadas,
  AVG(indice_fuzzy) FILTER (WHERE status::text LIKE 'aprovada%')::numeric(4,3) AS indice_medio_aprovadas,
  COUNT(*) FILTER (WHERE status::text LIKE 'aprovada%' AND faixa_fuzzy_atual = 'verde') AS aprovadas_verde,
  COUNT(*) FILTER (WHERE status::text LIKE 'aprovada%' AND faixa_fuzzy_atual = 'amarelo') AS aprovadas_amarelo,
  COUNT(*) FILTER (WHERE status::text LIKE 'aprovada%' AND faixa_fuzzy_atual = 'vermelho') AS aprovadas_vermelho,
  COUNT(DISTINCT campus_uff) FILTER (WHERE campus_uff IS NOT NULL) AS campi_envolvidos
FROM experiencia;

-- View: catálogo público (o que aparece no site para visitantes)
CREATE OR REPLACE VIEW view_catalogo_publico AS
SELECT 
  e.id,
  e.slug,
  e.titulo,
  e.resumo,
  e.data_inicio,
  e.data_fim,
  e.is_perene,
  e.status,
  e.campus_uff,
  e.municipio,
  e.uf,
  ce.nome AS categoria_editorial,
  ec.email_contato_publico,
  ec.instagram,
  ec.facebook,
  ec.youtube,
  ec.site_externo
FROM experiencia e
JOIN experiencia_conteudo ec ON ec.experiencia_id = e.id
LEFT JOIN categoria_editorial ce ON e.categoria_editorial_id = ce.id
WHERE e.status IN (
  'aprovada_ativa_em_andamento',
  'aprovada_ativa_perene',
  'aprovada_encerrada'
)
AND ec.versao_atual = 'publicado'
AND e.is_interna = true;

-- =============================================================
-- 5. SEEDS - Categorias Editoriais (9 grupos da Parte IV)
-- =============================================================

INSERT INTO categoria_editorial (nome, descricao, ordem) VALUES
('Metodologias e ferramentas didáticas inovadoras',
 'Metodologias e/ou produtos inovadores e criativos voltados para o aprimoramento do ensino e aprendizagem', 1),
('Jogos',
 'Jogos que tornam o ensino e aprendizagem mais atraentes e criativos', 2),
('Valorização e preservação da memória cultural',
 'Iniciativas voltadas para a preservação da memória, cultura e ancestralidade', 3),
('Geração de renda',
 'Aprimora processos que resultam na geração de renda e na autonomia econômica dos envolvidos', 4),
('Acesso a direitos e cidadania',
 'Reconhecimento de direitos de cidadania de populações tradicionais e promoção de direitos sociais e difusos', 5),
('Inovação e saúde',
 'Propõe melhorias ou oferece serviços na área da saúde de forma inovadora', 6),
('Formação de recursos humanos e intervenção social',
 'Iniciativas de formação e metodologias inovadoras voltadas para intervenção social', 7),
('Redes e políticas públicas',
 'Articulação de redes formadas por agências públicas e por atores sociais interessados', 8),
('Popularização e democratização da ciência e da tecnologia',
 'Divulgação da ciência em diferentes áreas do saber', 9);

-- =============================================================
-- 6. SEEDS - ODS (17 objetivos da ONU)
-- =============================================================

INSERT INTO ods (id, nome, descricao, cor_hex) VALUES
(1,  'Erradicação da pobreza', 'Acabar com a pobreza em todas as suas formas, em todos os lugares', '#E5243B'),
(2,  'Fome zero e agricultura sustentável', 'Acabar com a fome, alcançar a segurança alimentar e melhoria da nutrição e promover a agricultura sustentável', '#DDA63A'),
(3,  'Saúde e bem-estar', 'Assegurar uma vida saudável e promover o bem-estar para todos, em todas as idades', '#4C9F38'),
(4,  'Educação de qualidade', 'Assegurar a educação inclusiva e equitativa de qualidade, e promover oportunidades de aprendizagem ao longo da vida para todos', '#C5192D'),
(5,  'Igualdade de gênero', 'Alcançar a igualdade de gênero e empoderar todas as mulheres e meninas', '#FF3A21'),
(6,  'Água potável e saneamento', 'Assegurar a disponibilidade e gestão sustentável da água e saneamento para todos', '#26BDE2'),
(7,  'Energia limpa e acessível', 'Assegurar o acesso confiável, sustentável, moderno e a preço acessível à energia para todos', '#FCC30B'),
(8,  'Trabalho decente e crescimento econômico', 'Promover o crescimento econômico sustentado, inclusivo e sustentável, emprego pleno e produtivo, e trabalho decente para todos', '#A21942'),
(9,  'Indústria, inovação e infraestrutura', 'Construir infraestruturas resilientes, promover a industrialização inclusiva e sustentável e fomentar a inovação', '#FD6925'),
(10, 'Redução das desigualdades', 'Reduzir a desigualdade dentro dos países e entre eles', '#DD1367'),
(11, 'Cidades e comunidades sustentáveis', 'Tornar as cidades e os assentamentos humanos inclusivos, seguros, resilientes e sustentáveis', '#FD9D24'),
(12, 'Consumo e produção responsáveis', 'Assegurar padrões de produção e de consumo sustentáveis', '#BF8B2E'),
(13, 'Ação contra a mudança global do clima', 'Tomar medidas urgentes para combater a mudança climática e seus impactos', '#3F7E44'),
(14, 'Vida na água', 'Conservação e uso sustentável dos oceanos, dos mares e dos recursos marinhos para o desenvolvimento sustentável', '#0A97D9'),
(15, 'Vida terrestre', 'Proteger, recuperar e promover o uso sustentável dos ecossistemas terrestres, gerir de forma sustentável as florestas, combater a desertificação, deter e reverter a degradação da terra e deter a perda de biodiversidade', '#56C02B'),
(16, 'Paz, justiça e instituições eficazes', 'Promover sociedades pacíficas e inclusivas para o desenvolvimento sustentável, proporcionar o acesso à justiça para todos e construir instituições eficazes, responsáveis e inclusivas em todos os níveis', '#00689D'),
(17, 'Parcerias e meios de implementação', 'Fortalecer os meios de implementação e revitalizar a parceria global para o desenvolvimento sustentável', '#19486A');

-- =============================================================
-- 7. SEEDS - Grandes Áreas e Subáreas CNPq (nível 1 e 2)
-- =============================================================
-- ATENÇÃO: este é o seed reduzido. A tabela CNPq oficial completa
-- tem ~800 entradas em 4 níveis. Substituir antes do go-live.
-- =============================================================

INSERT INTO grande_area_cnpq (codigo, nome, ordem) VALUES
('1.00.00.00-3', 'Ciências Exatas e da Terra', 1),
('2.00.00.00-6', 'Ciências Biológicas', 2),
('3.00.00.00-9', 'Engenharias', 3),
('4.00.00.00-1', 'Ciências da Saúde', 4),
('5.00.00.00-4', 'Ciências Agrárias', 5),
('6.00.00.00-7', 'Ciências Sociais Aplicadas', 6),
('7.00.00.00-0', 'Ciências Humanas', 7),
('8.00.00.00-2', 'Linguística, Letras e Artes', 8),
('9.00.00.00-5', 'Outros', 9);

-- Subáreas (seed parcial nível 2)
INSERT INTO subarea_cnpq (grande_area_id, codigo, nome, nivel) VALUES
((SELECT id FROM grande_area_cnpq WHERE codigo='1.00.00.00-3'), '1.01', 'Matemática', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='1.00.00.00-3'), '1.02', 'Probabilidade e Estatística', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='1.00.00.00-3'), '1.03', 'Ciência da Computação', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='1.00.00.00-3'), '1.04', 'Astronomia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='1.00.00.00-3'), '1.05', 'Física', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='1.00.00.00-3'), '1.06', 'Química', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='1.00.00.00-3'), '1.07', 'Geociências', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='1.00.00.00-3'), '1.08', 'Oceanografia', 2),

((SELECT id FROM grande_area_cnpq WHERE codigo='2.00.00.00-6'), '2.01', 'Biologia Geral', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='2.00.00.00-6'), '2.02', 'Genética', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='2.00.00.00-6'), '2.03', 'Botânica', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='2.00.00.00-6'), '2.04', 'Zoologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='2.00.00.00-6'), '2.05', 'Ecologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='2.00.00.00-6'), '2.06', 'Morfologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='2.00.00.00-6'), '2.07', 'Fisiologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='2.00.00.00-6'), '2.08', 'Bioquímica', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='2.00.00.00-6'), '2.09', 'Biofísica', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='2.00.00.00-6'), '2.10', 'Farmacologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='2.00.00.00-6'), '2.11', 'Imunologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='2.00.00.00-6'), '2.12', 'Microbiologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='2.00.00.00-6'), '2.13', 'Parasitologia', 2),

((SELECT id FROM grande_area_cnpq WHERE codigo='3.00.00.00-9'), '3.01', 'Engenharia Civil', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='3.00.00.00-9'), '3.02', 'Engenharia de Minas', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='3.00.00.00-9'), '3.03', 'Engenharia de Materiais e Metalúrgica', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='3.00.00.00-9'), '3.04', 'Engenharia Elétrica', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='3.00.00.00-9'), '3.05', 'Engenharia Mecânica', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='3.00.00.00-9'), '3.06', 'Engenharia Química', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='3.00.00.00-9'), '3.07', 'Engenharia Sanitária', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='3.00.00.00-9'), '3.08', 'Engenharia de Produção', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='3.00.00.00-9'), '3.09', 'Engenharia Nuclear', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='3.00.00.00-9'), '3.10', 'Engenharia de Transportes', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='3.00.00.00-9'), '3.11', 'Engenharia Naval e Oceânica', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='3.00.00.00-9'), '3.12', 'Engenharia Aeroespacial', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='3.00.00.00-9'), '3.13', 'Engenharia Biomédica', 2),

((SELECT id FROM grande_area_cnpq WHERE codigo='4.00.00.00-1'), '4.01', 'Medicina', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='4.00.00.00-1'), '4.02', 'Odontologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='4.00.00.00-1'), '4.03', 'Farmácia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='4.00.00.00-1'), '4.04', 'Enfermagem', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='4.00.00.00-1'), '4.05', 'Nutrição', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='4.00.00.00-1'), '4.06', 'Saúde Coletiva', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='4.00.00.00-1'), '4.07', 'Fonoaudiologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='4.00.00.00-1'), '4.08', 'Fisioterapia e Terapia Ocupacional', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='4.00.00.00-1'), '4.09', 'Educação Física', 2),

((SELECT id FROM grande_area_cnpq WHERE codigo='5.00.00.00-4'), '5.01', 'Agronomia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='5.00.00.00-4'), '5.02', 'Recursos Florestais e Engenharia Florestal', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='5.00.00.00-4'), '5.03', 'Engenharia Agrícola', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='5.00.00.00-4'), '5.04', 'Zootecnia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='5.00.00.00-4'), '5.05', 'Medicina Veterinária', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='5.00.00.00-4'), '5.06', 'Recursos Pesqueiros e Engenharia de Pesca', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='5.00.00.00-4'), '5.07', 'Ciência e Tecnologia de Alimentos', 2),

((SELECT id FROM grande_area_cnpq WHERE codigo='6.00.00.00-7'), '6.01', 'Direito', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='6.00.00.00-7'), '6.02', 'Administração', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='6.00.00.00-7'), '6.03', 'Economia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='6.00.00.00-7'), '6.04', 'Arquitetura e Urbanismo', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='6.00.00.00-7'), '6.05', 'Planejamento Urbano e Regional', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='6.00.00.00-7'), '6.06', 'Demografia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='6.00.00.00-7'), '6.07', 'Ciência da Informação', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='6.00.00.00-7'), '6.08', 'Museologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='6.00.00.00-7'), '6.09', 'Comunicação', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='6.00.00.00-7'), '6.10', 'Serviço Social', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='6.00.00.00-7'), '6.11', 'Turismo', 2),

((SELECT id FROM grande_area_cnpq WHERE codigo='7.00.00.00-0'), '7.01', 'Filosofia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='7.00.00.00-0'), '7.02', 'Sociologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='7.00.00.00-0'), '7.03', 'Antropologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='7.00.00.00-0'), '7.04', 'Arqueologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='7.00.00.00-0'), '7.05', 'História', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='7.00.00.00-0'), '7.06', 'Geografia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='7.00.00.00-0'), '7.07', 'Psicologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='7.00.00.00-0'), '7.08', 'Educação', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='7.00.00.00-0'), '7.09', 'Ciência Política', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='7.00.00.00-0'), '7.10', 'Teologia', 2),

((SELECT id FROM grande_area_cnpq WHERE codigo='8.00.00.00-2'), '8.01', 'Linguística', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='8.00.00.00-2'), '8.02', 'Letras', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='8.00.00.00-2'), '8.03', 'Artes', 2),

((SELECT id FROM grande_area_cnpq WHERE codigo='9.00.00.00-5'), '9.01', 'Interdisciplinar', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='9.00.00.00-5'), '9.02', 'Ensino', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='9.00.00.00-5'), '9.03', 'Materiais', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='9.00.00.00-5'), '9.04', 'Biotecnologia', 2),
((SELECT id FROM grande_area_cnpq WHERE codigo='9.00.00.00-5'), '9.05', 'Ciências Ambientais', 2);

-- =============================================================
-- ÁREAS TEMÁTICAS DE EXTENSÃO (FORPROEX)
-- =============================================================
-- Padrão nacional brasileiro para classificação de projetos de
-- extensão universitária. Tecnologias sociais são, por natureza,
-- iniciativas de extensão, por isso esta classificação é obrigatória.

CREATE TABLE area_tematica_forproex (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo varchar(10) UNIQUE NOT NULL,
  nome varchar(100) NOT NULL,
  descricao text NOT NULL,
  ordem integer DEFAULT 0,
  ativa boolean DEFAULT true
);

CREATE TABLE experiencia_forproex (
  experiencia_id uuid REFERENCES experiencia(id) ON DELETE CASCADE,
  forproex_id uuid REFERENCES area_tematica_forproex(id),
  principal boolean DEFAULT false,
  PRIMARY KEY (experiencia_id, forproex_id)
);

CREATE INDEX idx_experiencia_forproex ON experiencia_forproex(experiencia_id);

-- Seed das 8 áreas temáticas FORPROEX
INSERT INTO area_tematica_forproex (codigo, nome, descricao, ordem) VALUES
('COM', 'Comunicação',               'Comunicação social, mídia comunitária, produção de material educativo, rádio e TV.', 1),
('CUL', 'Cultura',                   'Produção cultural, memória, patrimônio, folclore, artesanato e artes.', 2),
('DHJ', 'Direitos Humanos e Justiça', 'Cidadania, ética, inclusão, assistência jurídica, combate a preconceitos.', 3),
('EDU', 'Educação',                  'Educação básica, superior, profissional, popular, especial e de jovens e adultos.', 4),
('AMB', 'Meio Ambiente',             'Ecologia, desenvolvimento sustentável, recursos hídricos, gestão ambiental.', 5),
('SAU', 'Saúde',                     'Saúde pública, nutrição, enfermagem, saúde do trabalhador e saúde coletiva.', 6),
('TEC', 'Tecnologia e Produção',     'Desenvolvimento tecnológico, difusão de tecnologias, desenvolvimento rural e industrial.', 7),
('TRA', 'Trabalho',                  'Economia solidária, qualificação profissional, relações de trabalho.', 8);

-- =============================================================
-- SEEDS - Perguntas Fuzzy (20 perguntas, 5 dimensões, escala 0-10)
-- =============================================================

INSERT INTO pergunta_fuzzy (codigo, dimensao, texto_pergunta, ordem) VALUES
-- Dimensão 1 — Participação Comunitária (P) — peso 0.30
('P1', 'participacao_comunitaria', 'A comunidade participa das decisões do projeto', 1),
('P2', 'participacao_comunitaria', 'Os beneficiários influenciam diretamente o funcionamento', 2),
('P3', 'participacao_comunitaria', 'Há espaços coletivos de deliberação', 3),
('P4', 'participacao_comunitaria', 'O projeto é construído com a comunidade, e não para ela', 4),

-- Dimensão 2 — Impacto Social (I) — peso 0.25
('I1', 'impacto_social', 'O projeto melhora as condições de vida da comunidade', 1),
('I2', 'impacto_social', 'Há evidências concretas de transformação social', 2),
('I3', 'impacto_social', 'O projeto reduz desigualdades locais', 3),
('I4', 'impacto_social', 'O impacto é percebido pelos beneficiários', 4),

-- Dimensão 3 — Apropriação Tecnológica (A) — peso 0.20
('A1', 'apropriacao_tecnologica', 'A comunidade entende como o projeto funciona', 1),
('A2', 'apropriacao_tecnologica', 'Os usuários conseguem operar a tecnologia de forma autônoma', 2),
('A3', 'apropriacao_tecnologica', 'O conhecimento técnico é compartilhado', 3),
('A4', 'apropriacao_tecnologica', 'Há independência de especialistas externos', 4),

-- Dimensão 4 — Sustentabilidade (S) — peso 0.15
('S1', 'sustentabilidade', 'O projeto consegue se manter ao longo do tempo', 1),
('S2', 'sustentabilidade', 'Há autonomia financeira ou organizacional', 2),
('S3', 'sustentabilidade', 'O projeto resiste a mudanças externas', 3),
('S4', 'sustentabilidade', 'Existem estratégias de continuidade', 4),

-- Dimensão 5 — Replicabilidade (R) — peso 0.10
('R1', 'replicabilidade', 'O projeto pode ser adaptado para outros contextos', 1),
('R2', 'replicabilidade', 'A metodologia é documentada', 2),
('R3', 'replicabilidade', 'Outros grupos conseguem reproduzir a iniciativa', 3),
('R4', 'replicabilidade', 'O modelo é flexível a diferentes realidades', 4);

-- =============================================================
-- 9. SEEDS - Configurações iniciais do sistema
-- =============================================================

INSERT INTO configuracao_sistema (chave, valor, descricao, categoria) VALUES
('hero_titulo_pt', '"Portal LISA - Tecnologias Sociais da UFF"'::jsonb, 'Título principal da home em português', 'conteudo_publico'),
('hero_titulo_en', '"LISA Portal - UFF Social Technologies"'::jsonb, 'Título principal da home em inglês', 'conteudo_publico'),
('hero_subtitulo_pt', '"Conheça as iniciativas de inovação social desenvolvidas na Universidade Federal Fluminense"'::jsonb, 'Subtítulo da home em português', 'conteudo_publico'),

-- Configurações do modelo fuzzy (valores fixos v2.0, mas armazenados aqui para documentação)
('fuzzy_peso_participacao', '0.30'::jsonb, 'Peso da dimensão Participação Comunitária no índice linear', 'scoring'),
('fuzzy_peso_impacto', '0.25'::jsonb, 'Peso da dimensão Impacto Social no índice linear', 'scoring'),
('fuzzy_peso_apropriacao', '0.20'::jsonb, 'Peso da dimensão Apropriação Tecnológica no índice linear', 'scoring'),
('fuzzy_peso_sustentabilidade', '0.15'::jsonb, 'Peso da dimensão Sustentabilidade no índice linear', 'scoring'),
('fuzzy_peso_replicabilidade', '0.10'::jsonb, 'Peso da dimensão Replicabilidade no índice linear', 'scoring'),
('fuzzy_faixa_vermelho_max', '0.3'::jsonb, 'Limite superior da faixa vermelha (não é TS)', 'scoring'),
('fuzzy_faixa_amarelo_max', '0.7'::jsonb, 'Limite superior da faixa amarela (em transição)', 'scoring'),
('fuzzy_versao_motor', '"2.0-fuzzy"'::jsonb, 'Versão atual do motor de inferência fuzzy', 'scoring'),
('fuzzy_gate_triagem_min', '0.3'::jsonb, 'Índice fuzzy mínimo na triagem para liberar cadastro completo (amarelo em diante)', 'scoring'),
('fuzzy_triagem_bloqueio_mensagem', '"O Laboratório de Inovação Social Aberto adota parâmetros qualitativos e quantitativos para garantir que as experiências do catálogo sejam efetivamente tecnologias sociais."'::jsonb, 'Mensagem exibida quando triagem bloqueia cadastro', 'scoring'),

('convite_atualizacao_dias_validade', '30'::jsonb, 'Quantos dias o link mágico de atualização permanece válido', 'feature_flag'),
('edital_atual_nome', '"Edital de Chamamento 2026"'::jsonb, 'Nome do edital ativo', 'edital'),
('edital_atual_ativo', 'false'::jsonb, 'Se o formulário público está aceitando submissões', 'feature_flag');

-- =============================================================
-- 10. ROW LEVEL SECURITY (RLS) - placeholder
-- =============================================================
-- O Supabase recomenda habilitar RLS em TODAS as tabelas.
-- As policies devem ser definidas conforme as regras de negócio:
--
-- - Tabelas públicas (catalogo_publico, ods, categoria_editorial,
--   grande_area_cnpq, subarea_cnpq): leitura pública, escrita só admin
-- - Tabelas de operação (experiencia, experiencia_*, anexo, etc):
--   inserção pública (formulário), leitura/edição só admin
-- - Tabelas administrativas (admin_perfil, log_moderacao,
--   configuracao_sistema): só admin autenticado
--
-- Implementar as policies depois, usando o painel do Supabase ou
-- comandos CREATE POLICY. Exemplo:
--
-- ALTER TABLE experiencia ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "leitura_publica_aprovadas" ON experiencia
--   FOR SELECT TO anon
--   USING (status::text LIKE 'aprovada%');
--
-- CREATE POLICY "insercao_publica" ON experiencia
--   FOR INSERT TO anon
--   WITH CHECK (true);
--
-- CREATE POLICY "admin_acesso_total" ON experiencia
--   FOR ALL TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- =============================================================
-- FIM DO SETUP
-- =============================================================
-- Verificações pós-instalação:
-- 1. SELECT COUNT(*) FROM ods;                       -- deve retornar 17
-- 2. SELECT COUNT(*) FROM categoria_editorial;       -- deve retornar 9
-- 3. SELECT COUNT(*) FROM grande_area_cnpq;          -- deve retornar 9
-- 4. SELECT COUNT(*) FROM subarea_cnpq;              -- deve retornar ~63
-- 5. SELECT COUNT(*) FROM pergunta_fuzzy;            -- deve retornar 20
-- 6. SELECT DISTINCT dimensao FROM pergunta_fuzzy;   -- deve retornar 5 dimensões
-- 7. SELECT COUNT(*) FROM area_tematica_forproex;    -- deve retornar 8
-- 8. SELECT COUNT(*) FROM configuracao_sistema;      -- deve retornar 19
-- =============================================================
