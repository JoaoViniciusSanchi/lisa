-- =============================================================
-- 0004_macroarea_ts.sql
-- Cria tabela de macroareas temáticas de tecnologia social
-- e popula com as 8 macroareas do Portal LISA.
-- Migração aditiva — não afeta dados existentes.
-- =============================================================

CREATE TABLE macroarea_ts (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo           varchar(10)  UNIQUE NOT NULL,
  nome             varchar(200) NOT NULL,
  nome_en          varchar(200),
  descricao        text,
  inclui           text,           -- subtemas em texto livre
  cnpq_sugerido    text,           -- ex: 'Ciências Humanas; Ciências Sociais Aplicadas'
  extensao_sugerida text,          -- ex: 'Direitos Humanos e Justiça; Educação'
  ods_sugeridos    text,           -- ex: '1, 4, 5, 10, 16'
  ordem            integer,
  ativa            boolean DEFAULT true,
  criado_em        timestamp DEFAULT now()
);

COMMENT ON TABLE macroarea_ts IS
  'Macroareas temáticas de tecnologia social do Portal LISA. '
  'Usadas como pré-classificação no formulário de cadastro '
  '(etapa 03) para orientar as escolhas de CNPq, FORPROEX e ODS.';

-- RLS: leitura pública, escrita apenas pelo service role
ALTER TABLE macroarea_ts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de macroarea_ts"
  ON macroarea_ts FOR SELECT USING (true);

CREATE POLICY "Inserção/atualização apenas via service role"
  ON macroarea_ts FOR ALL USING (auth.role() = 'service_role');

-- =============================================================
-- Seed — 8 macroareas
-- =============================================================

INSERT INTO macroarea_ts
  (codigo, nome, nome_en, inclui, cnpq_sugerido, extensao_sugerida, ods_sugeridos, ordem)
VALUES
  (
    'MAC1',
    'Desenvolvimento Social e Direitos',
    'Social Development and Rights',
    'Assistência social, inclusão, cidadania, direitos humanos, combate à desigualdade, empoderamento comunitário, habitação popular, acesso à justiça',
    'Ciências Humanas; Ciências Sociais Aplicadas',
    'Direitos Humanos e Justiça; Educação; Cultura',
    '1, 4, 5, 10, 16',
    1
  ),
  (
    'MAC2',
    'Trabalho, Renda e Economia Solidária',
    'Work, Income and Solidarity Economy',
    'Cooperativismo, economia solidária, empreendimentos populares, geração de renda, qualificação profissional, inclusão produtiva, feiras e mercados locais',
    'Ciências Sociais Aplicadas; Engenharias',
    'Trabalho; Tecnologia e Produção',
    '8, 9',
    2
  ),
  (
    'MAC3',
    'Saúde, Bem-Estar e Cuidado',
    'Health, Well-Being and Care',
    'Saúde pública, saúde mental, cuidado comunitário, nutrição, acessibilidade à saúde, saúde do trabalhador, agentes comunitários de saúde',
    'Ciências da Saúde; Ciências Biológicas',
    'Saúde',
    '3',
    3
  ),
  (
    'MAC4',
    'Sustentabilidade Ambiental e Território',
    'Environmental Sustainability and Territory',
    'Agroecologia, gestão ambiental, energia renovável, resíduos sólidos, saneamento, territórios tradicionais, recursos hídricos, biodiversidade',
    'Ciências Agrárias; Ciências Biológicas; Ciências Exatas e da Terra',
    'Meio Ambiente',
    '6, 7, 11, 12, 13, 14, 15',
    4
  ),
  (
    'MAC5',
    'Habitação, Infraestrutura e Cidades',
    'Housing, Infrastructure and Cities',
    'Moradia popular, urbanismo social, infraestrutura comunitária, mobilidade urbana, regularização fundiária, acesso a serviços urbanos básicos',
    'Engenharias; Ciências Sociais Aplicadas',
    'Tecnologia e Produção; Direitos Humanos e Justiça',
    '9, 11',
    5
  ),
  (
    'MAC6',
    'Educação, Cultura e Comunicação',
    'Education, Culture and Communication',
    'Educação popular, inclusão digital, patrimônio cultural, comunicação comunitária, artes, mídia alternativa, memória coletiva, identidades culturais',
    'Ciências Humanas; Linguística, Letras e Artes',
    'Educação; Cultura; Comunicação',
    '4, 10',
    6
  ),
  (
    'MAC7',
    'Segurança Alimentar e Nutricional',
    'Food and Nutritional Security',
    'Agricultura familiar, hortas comunitárias, banco de alimentos, acesso a alimentos saudáveis, soberania alimentar, agroindústria popular',
    'Ciências Agrárias; Ciências da Saúde',
    'Meio Ambiente; Saúde; Trabalho',
    '2, 3, 12',
    7
  ),
  (
    'MAC8',
    'Governança, Participação e Gestão Social',
    'Governance, Participation and Social Management',
    'Participação democrática, controle social, gestão pública participativa, transparência, redes sociais de suporte, orçamento participativo, conselhos comunitários',
    'Ciências Sociais Aplicadas',
    'Direitos Humanos e Justiça',
    '16, 17',
    8
  );
