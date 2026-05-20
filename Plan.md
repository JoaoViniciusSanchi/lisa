O Portal LISA é o catálogo público de tecnologias sociais da UFF/AGIR, coordenado pela Profa. Elaine Sigette, com função-coração de matchmaking entre demandas sociais e iniciativas universitárias. O MVP é um Next.js (App Router) + Supabase (Postgres + Auth + Storage) bilíngue PT/EN, com tema escuro estrito, cantos retos absolutos, paleta neutra + accent teal e tipografia Inter/Inter Tight. O cérebro do cadastro é um gate fuzzy de duas fases: 20 perguntas (5 dimensões × 4) calculam um índice 0–1 que bloqueia (vermelho < 0.3) ou libera (amarelo/verde) o cadastro completo de 8 etapas — toda a lógica fuzzy roda em TS puro no servidor. Banco já modelado (~23 tabelas + 4 views + 18 enums + seeds de ODS, categoria editorial, FORPROEX e perguntas fuzzy), com fluxo de tradução por DeepL + duas revisões humanas como bloqueante de publicação. Admin é URL oculta com Supabase Auth, RLS obrigatório e log imutável de moderação. Custo previsto R$ 0/mês no MVP — sem IA na moderação, scoring/triagem 100% local.

b) Componentes reutilizáveis identificados
Globais (atomic / components/ui/)
LogoMark (quadrado 32–36px com "L" desenhado em borda)
Eyebrow (label uppercase 11px, letter-spacing 0.18em, accent-glow)
SectionNum ([ 02 ] em fonte tabular)
Hairline / HairlineVertical (linhas 1px decorativas)
Button com variantes primary / secondary / small (cantos retos, hover translateY(-2px))
GlassPanel / GlassPanelStrong (gradiente petrol + backdrop-filter)
Header fixo com blur (varia entre home/cadastro)
LangSwitch PT/EN
Home (components/home/)
Hero (h1 com mistura de pesos extralight/medium/italic)
DotGrid (canvas interativo com repulsão pelo mouse — port para hook React + cleanup)
MetaCard (Edital atual / última atualização / status — cards no glass)
ConceptCard (numerado 01/02/03 no glass)
StatCounter (número grande com IntersectionObserver, gradiente vertical no texto)
DecoNumber (algarismo gigante de fundo, opacidade baixa)
Timeline horizontal com pinning + scroll hijacking GSAP (precisa wrapper Client + dynamic import do GSAP)
CatalogCard (com chips ODS coloridos, número de série, hover shimmer)
Cadastro (components/cadastro/)
ProgressBar em fases (com step-dot, step-connector, fase atual, completed/active/inactive)
WelcomeScreen + InfoTile grid
FuzzySlider (slider 0–10 com gradiente vermelho/amarelo/verde, anchors textuais, escala numérica, valor live) — componente crítico
FuzzyIntro (caixa lateral com peso da dimensão)
FuzzyResultGauge (SVG circular animado com stroke-dashoffset, cor por faixa)
DimensionBreakdown (5 barrinhas P/I/A/S/R)
FuzzyResultActions (proceed vs blocked, com mensagem configurável)
FieldGroup + FieldLabel + FieldInput / FieldSelect / FieldTextarea com CharCounter
Pill (toggle multi-select)
OdsCard (17 cards com cor lateral por ODS)
ForproexCard / CategoryCard (card grande com título + descrição, multi-select)
UploadZone (dashed border, upload de imagens com preview)
FormNavigation (prev/next/meta)
DraftIndicator (toast bottom-right, "Rascunho salvo")
SuccessScreen + ProtocolBox
Compartilhados (Catálogo, Admin, Conectar)
Filtros (ODS, CNPq, FORPROEX, campus, status, data)
Breadcrumb
EmptyState
LoadingState (linhas hairline em motion)
c) Plano de fases (Next.js + Supabase)
Ordeno por dependência técnica, não por valor — quero destravar o caminho crítico primeiro.

Fase 0 — Setup & infraestrutura (1–2 dias)
Criar portal-lisa-app/ com Next.js 14 App Router + TS + Tailwind (vejo que a pasta já parece existir — confirmar)
Configurar Tailwind com as CSS variables da paleta + override de border-radius: 0 global
Importar fontes Inter/Inter Tight via next/font/google
Setup do roteamento bilíngue [locale] (pt/en) com next-intl ou similar
Criar projeto Supabase, rodar lisa_setup.sql, validar contagens
Configurar variáveis de ambiente (.env.local), tipos gerados (supabase gen types)
Estrutura de pastas conforme CLAUDE.md (app/, components/, lib/)
Fase 1 — Design system + componentes atômicos (2–3 dias)
Componentes components/ui/* listados em (b)
Layout root com header fixo, footer
Storybook opcional (ou simplesmente uma rota /dev/components interna) para validar visualmente
Fase 2 — Home estática (3–5 dias)
Migração pixel-perfect do lisa_home_mockup.html em React
DotGrid como Client Component com cleanup adequado de canvas/listener
Timeline horizontal: GSAP via dynamic({ ssr: false }), ScrollTrigger registrado client-side
StatCounter puxa números reais via Server Component (view view_estatisticas_dashboard)
Catálogo em destaque puxa 6 cards reais via Server Component (view view_catalogo_publico)
Otimização: respeitar prefers-reduced-motion
Fase 3 — Motor fuzzy + Cadastro (5–7 dias) — caminho crítico
lib/fuzzy/engine.ts: funções baixo/medio/alto, regras (já temos o JS do mockup como referência, portar para TS tipado), defuzzificação, classificação, índice linear
Testes unitários do motor com o exemplo do Apêndice A do lisa_perguntas_score.md (índice esperado ~0.63 fuzzy / ~0.67 linear)
Estado do formulário: Zustand ou React Context + reducer (auto-save em localStorage)
Steps 0–6 (welcome + 5 dimensões + gate de resultado)
Server Action runTriagem(answers) que recalcula o motor no servidor (cliente é só preview)
Steps 7–14 (cadastro completo de 8 etapas)
Server Action submitExperiencia(payload) que escreve em experiencia + experiencia_traducao(pt) + experiencia_pessoa + experiencia_cnpq + experiencia_ods + experiencia_forproex + resposta_fuzzy + justificativa_dimensao + avaliacao_fuzzy + anexo + dispara disparo_email
Upload de imagens para Supabase Storage com client component
Tela de sucesso com protocolo
Fase 4 — Catálogo público (3–4 dias)
/[locale]/catalogo com filtros server-side
/[locale]/catalogo/[slug] página individual da experiência
SEO: metadata, OG, hreflang
Skeleton states, paginação ou infinite scroll
Fase 5 — /conectar simples (1–2 dias)
Formulário de demanda → tabela demanda_externa (a ser criada — não existe no schema)
E-mail aos admins via Edge Function
Fase 6 — Admin & moderação (5–7 dias)
/admin-lisa-xyz com Supabase Auth (login/logout, middleware protegendo rotas)
Dashboard com view_estatisticas_dashboard
Fila de moderação com view_fila_moderacao (ordenada por índice fuzzy)
Página de detalhe da experiência com aprovar/rejeitar/editar
Painel de configurações lendo/escrevendo configuracao_sistema
Log de moderação automático (trigger de DB ou wrapper na server action)
Export CSV das respostas fuzzy cruas
Fase 7 — Tradução bilíngue (3–5 dias)
Edge Function translate-experiencia chamando DeepL API
Painel de revisão de tradução (1ª e 2ª revisão) com diff PT/EN lado a lado
Bloqueio de publicação até status_global = 'publicada'
Fase 8 — E-mails transacionais (2 dias)
Edge Function send-email com Resend
Templates lidos de configuracao_sistema (categoria templates_email) — seeds desses templates ainda não existem no SQL
Disparo nos eventos: submissão, notificação admin, aprovação, rejeição, solicitação de atualização
Fase 9 — Convites de atualização & migração (3–4 dias)
Rota pública /atualizar/[token] (sem login)
Cron job (Edge Function ou n8n externo) para emitir solicitações
Roteiro/script de importação para a estagiária trazer as ~110 experiências legadas
Fase 10 — RLS + segurança + go-live (2–3 dias)
Policies em todas as tabelas (placeholder já documentado no SQL)
Auditoria de injeção, rate-limit no /cadastrar e /conectar
Migration final do CNPq nível 3+
Smoke test bilíngue end-to-end
Total estimado: ~30–45 dias de desenvolvimento (4–7 semanas), alinhado com o "4–7 semanas" do CLAUDE.md.

d) Dúvidas e ambiguidades a resolver antes de codar
Inconsistências documentais (precisam decisão sua)
Coordenadora: CLAUDE.md = "Elaine Sigette" / consolidacao.md = "Thelma Machado". Qual está certa?
Modelo de scoring: CLAUDE.md + lisa_perguntas_score.md + SQL = fuzzy EFITS v2.0 (20 perguntas, 5 dimensões). lisa_consolidacao.md + lisa_schema.dbml = determinístico booleano (30 perguntas, 7 dimensões). Confirmo que devo seguir o fuzzy e tratar consolidacao/dbml como histórico, certo?
Schema DBML vs SQL: o .dbml tem pergunta_score/resposta_score/avaliacao_score/dimensao_score (modelo antigo). O .sql tem pergunta_fuzzy/resposta_fuzzy/avaliacao_fuzzy/dimensao_fuzzy + justificativa_dimensao + area_tematica_forproex + experiencia_forproex. A verdade é o SQL — devo regenerar o DBML?
Total de tabelas: CLAUDE.md fala em "21 tabelas", lisa_setup.sql cria 23, e você mencionou 33 no prompt. Por que a diferença? Há tabelas que faltam?
Lacunas estruturais (decisões novas)
Tabelas faltando para o cadastro: o mockup tem 4 etapas que não têm tabela:

Etapa 04 "Finalidade Social" (7 categorias próprias do LISA) — é diferente das 9 categorias editoriais já no schema?
Etapa 06 "Público-Alvo", "Tipo de Solução Tecnológica", "Arranjo Institucional", "Base Teórica/Abordagem"
Devo criar tabelas de taxonomia para cada uma + N:N com experiencia? Ou armazenar como array JSONB em experiencia?
demanda_externa: CLAUDE.md menciona que será criada na primeira sprint para /conectar. Confirmo que essa migration entra no roadmap?

Categoria editorial vs Finalidade Social: o SQL tem 9 categorias editoriais (Metodologias didáticas, Jogos, Memória cultural, etc). O mockup mostra outras 7 ("Inclusão Socioprodutiva", "Educação e Formação", etc). São conjuntos diferentes ou um substitui o outro?

Bugs no mockup que afetam migração
No JS do cadastro (linha 2078), navMeta mostra "Cadastro · X de 6", mas CADASTRO_STEPS tem 8 elementos. Devo corrigir para 8 ao migrar?
Welcome screen menciona "8 etapas" no texto, mas o array cadastroLabels tem 8 itens — está consistente. OK aqui.
O step 6 (resultado da triagem) calcula fuzzy no cliente. Decisão clara: o servidor recalcula via Server Action antes de gravar (cliente é apenas preview, não fonte da verdade). Confirma?
Decisões de produto
portal-lisa-app/CLAUDE.md está aberto no IDE. Já existe uma subpasta com Next.js inicializado? Se sim, parto dela ou começo do zero numa pasta limpa? (não vou olhar antes da sua confirmação)
Templates de e-mail: o SQL tem só 3 entradas em configuracao_sistema (hero_titulo PT/EN/subtitulo). Os 7 tipos de e-mail (email_tipo) não têm templates seed. Quem escreve esses textos — você, a coordenadora ou eu redijo um draft em PT que ela revisa?
Locale routing: uso next-intl (mais robusto, traduções em arquivos JSON) ou monto manualmente com [locale] + Accept-Language?
Auto-save do rascunho está em localStorage só nas perguntas fuzzy. Devo estender pra todo o formulário antes ou depois do gate de triagem? (CLAUDE.md diz que antes do gate só pode existir em localStorage, nada no banco — confirmo que mantenho assim?)
GSAP licensing: CLAUDE.md afirma "licença gratuita para projeto acadêmico não-comercial". Vamos usar a versão pública do CDN ou subir GSAP via npm? (Tem implicação se houver migração futura para a versão paga.)
Pesos das dimensões: o SQL tem fuzzy_peso_* em configuracao_sistema mas o CLAUDE.md diz que são fixos no MVP e estão no código. Devo ler os pesos do banco a cada cálculo (mais flexível, custa um query) ou hardcodar e usar o banco só como documentação?
