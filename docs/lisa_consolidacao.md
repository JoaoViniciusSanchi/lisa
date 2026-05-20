# Portal LISA — Documento de Consolidação

**Projeto:** Portal LISA (Laboratório de Inovação Social e Ambiental) — UFF/AGIR  
**Coordenadora:** Profa. Dra. Thelma Machado (AGIR/PROPPI/UFF)  
**Objetivo geral:** construir um portal de matchmaking entre demandas sociais e iniciativas de inovação, com foco inicial no catálogo de tecnologias sociais.  
**Data desta consolidação:** abril/2026

---

## 1. Escopo

### O que entra no MVP (4–6 semanas, possivelmente 5–7 com bilíngue full)

- Formulário público multi-step de cadastro de experiência (sem login)
- Sistema de pontuação 100% determinístico baseado em perguntas booleanas com pesos calibrados pelo referencial Dagnino/ITS
- Painel admin oculto (URL não-pública + Supabase Auth com um único usuário)
- Catálogo público com filtros (ODS, grandes áreas CNPq, categoria editorial, campus, status, data)
- Disparo de e-mails automáticos: confirmação ao coordenador, notificação aos admins, disparo em massa para reativação/atualização de experiências antigas
- Status de experiência como cidadão de primeira classe (8 estados possíveis)
- Migração inicial das ~110 experiências existentes pela estagiária
- Bilíngue PT/EN desde o lançamento, com tradução automática (DeepL/Google) + revisão humana em duas etapas
- Aceita Visão 1 (Dagnino/ITS) **e** Visão 2 (Bava/tecnologia para o social) — catálogo inclusivo

### Fora do MVP (v2+)

- Rede universitária, tecnologia cidadã, certificação, startup social
- Base de demandantes
- Base de especialistas (mas a tabela `pessoa` já é modelada para suportar isso depois sem retrabalho)
- Chatbot de matchmaking com IA
- Blog
- Página "sobre nós"
- Newsletter pública automática
- Catálogo em formato de livro com export PDF (modo "InDesign no navegador")
- Tabela CNPq com hierarquia completa de 4 níveis (no MVP só nível 1 e 2)

---

## 2. Stack técnica

| Camada | Escolha | Custo |
|---|---|---|
| Frontend | Next.js + Tailwind CSS | Grátis |
| Hospedagem frontend | Vercel (plano Hobby) | Grátis |
| Backend / DB / Auth / Storage | Supabase (plano Free) | Grátis |
| E-mail transacional | Resend (plano Free, 3000/mês) | Grátis |
| Tradução automática | DeepL Free (500k chars/mês) + Google Cloud Translation (créditos iniciais) | Grátis no uso corrente |
| IA para scoring | **Nenhuma** — scoring é determinístico | — |
| IA para matchmaking (v2) | A definir: provavelmente Gemini Flash ou Claude Haiku | ~R$ 1/mês estimado |
| **Custo total mensal previsto** | | **R$ 0** |

### Por que essa stack

- Zero servidor para administrar
- Tudo é declarativo (cria tabela no Supabase pelo painel visual, vira API automaticamente)
- Código bem comentado e documentação enorme — fácil manutenção a longo prazo
- Migra fácil se precisar (Postgres é Postgres em qualquer lugar)
- AI Studio e Claude geram código Next + Supabase muito bem
- Suficiente para o volume previsto (centenas de experiências, não milhões)

---

## 3. Decisões arquiteturais consolidadas

### Autenticação
- **Sem login para usuários externos.** Cadastro de experiência é submissão única.
- **Login só para admins**, via Supabase Auth, com um único usuário criado manualmente. URL do painel admin é oculta (`/admin-lisa-xyz` ou similar).

### Moderação
- Toda submissão passa por aprovação manual humana.
- Sistema de pontuação **organiza a fila de moderação**, não decide nada.
- Decisão final é sempre humana.

### Anexos
- **Estratégia híbrida:** imagens leves (capa + 2 secundárias) no Supabase Storage; vídeos e PDFs grandes via link externo.
- **3 slots padronizados** de imagem por experiência (capa, secundária 1, secundária 2) — obrigatórios para publicação no catálogo.

### Categorização
- **Hierárquica:** Grande Área CNPq → Subárea CNPq → Categoria Editorial do Catálogo (9 grupos da Parte IV do formulário 2025).
- **ODS** como categorização independente e cruzada (uma experiência pode ter múltiplas ODS).
- **Visão dominante** (V1/V2/híbrida) calculada automaticamente a partir do score por dimensão.

### Bilíngue
- **Cenário escolhido: Bilíngue full no MVP** com risco de atraso assumido.
- **Tradução automática DeepL/Google** como rascunho, com revisão humana obrigatória em duas etapas (estagiária → segunda revisão da equipe).
- **Tradução é integral**, não summary condensado (todos os 4 campos editoriais traduzidos).
- **Chaveador PT/EN** ativo desde o dia 1 do MVP.
- **Tradução é bloqueante para publicação** (rota de fuga: tornar não-bloqueante se virar gargalo).
- **Estrutura: tabela `experiencia_traducao` separada por idioma**, suporta N idiomas no futuro sem alteração de schema.

### Scoring
- **100% determinístico**, sem IA na fase de moderação.
- **Perguntas booleanas em tabela configurável** (`pergunta_score`), permite ajustar pesos sem mexer no código.
- **Snapshot de pesos** preservado em `resposta_score` para auditoria histórica.
- **7 dimensões teóricas** baseadas no referencial Dagnino/ITS: participação_comunidade, demanda_social_concreta, construcao_conhecimento, reaplicabilidade, sustentabilidade, processo_democratico, sinais_institucionais.
- **Faixas de moderação:** alta_aderencia (75-100), media_aderencia (50-74), visao_2 (30-49), baixa_aderencia (0-29).

### Conteúdo editorial
- **Estrutura espelha o catálogo real** (baseado em análise da página "Cozinha CuidAR"):
  - Título
  - Histórico (combina contexto, problema, objetivos, descrição)
  - Metodologia
  - Resultados e Impactos
  - Desafios e Perspectivas
  - Mais informações (contato, equipe, redes sociais)
- **Versionamento bruto → editado → publicado** com snapshot imutável do texto original do coordenador para auditoria.

---

## 4. Schema do banco — Rodada 1 (Núcleo e Taxonomias)

```dbml
// Núcleo
Table experiencia { ... }  // ver detalhes na seção 5
Enum experiencia_status {
  rascunho
  em_moderacao
  aprovada_ativa_em_andamento
  aprovada_ativa_perene
  aprovada_encerrada
  aguardando_confirmacao_coordenador
  inativa_nao_confirmada
  rejeitada
}

// Pessoas (preparada para virar Especialistas na v2)
Table pessoa { ... }
Enum pessoa_vinculo {
  docente
  tecnico_administrativo
  estudante_graduacao
  estudante_pos
  pesquisador_externo
  membro_comunidade
  representante_organizacao
  outro
}

Table experiencia_pessoa { ... }
Enum papel_na_experiencia {
  coordenador
  vice_coordenador
  membro_equipe
  representante_comunidade
  parceiro_externo
}

// Taxonomia CNPq (hierárquica, auto-referência para níveis 3+)
Table grande_area_cnpq { ... }
Table subarea_cnpq { ... }
Table experiencia_cnpq { ... }

// Taxonomia Editorial (9 grupos da Parte IV)
Table categoria_editorial { ... }

// Taxonomia ODS (17 objetivos da ONU)
Table ods { ... }
Table experiencia_ods { ... }
```

(Schema DBML completo está nas mensagens anteriores da conversa, salvar este arquivo + conversa garante reprodutibilidade.)

---

## 5. Schema do banco — Rodada 2 (Operação)

### Tabelas finais da Rodada 2

1. **`experiencia_conteudo`** — contatos, redes sociais, versionamento editorial global, snapshot do texto bruto. **Não contém texto editorial** (foi movido para `experiencia_traducao`).
2. **`experiencia_traducao`** — uma linha por idioma por experiência. Contém título e os 4 campos editoriais (`historico`, `metodologia`, `resultados_impactos`, `desafios_perspectivas`), além do fluxo completo de tradução por campo (status_por_campo em JSONB, rascunho_api em JSONB, timestamps de cada etapa, IDs dos revisores).
3. **`pergunta_score`** — perguntas booleanas configuráveis, com peso, dimensão e ordem.
4. **`resposta_score`** — respostas dadas, com snapshot imutável de pontos atribuídos.
5. **`avaliacao_score`** — snapshots históricos de cálculo de score, com score por dimensão e visão dominante calculada.
6. **`anexo`** — 3 slots padronizados (foto_capa, foto_secundaria_1, foto_secundaria_2) + tipos complementares.
7. **`historico_status`** — log imutável de mudanças de estado da experiência.
8. **`disparo_email`** — toda comunicação enviada pelo sistema, com tracking via Resend.
9. **`convite_atualizacao`** — links mágicos com token para coordenadores reativarem/atualizarem experiências antigas sem login.

### Enums adicionais da Rodada 2

- `versao_conteudo`: bruto, em_revisao_editorial, pt_pronto, em_traducao, publicavel, publicado
- `traducao_status`: pendente, rascunho_api_gerado, em_primeira_revisao, primeira_revisao_concluida, em_segunda_revisao, publicavel, publicada, nao_aplicavel
- `dimensao_score`: participacao_comunidade, demanda_social_concreta, construcao_conhecimento, reaplicabilidade, sustentabilidade, processo_democratico, sinais_institucionais
- `faixa_score`: alta_aderencia, media_aderencia, visao_2, baixa_aderencia
- `visao_ts`: visao_1_construcao_sociotecnica, visao_2_tecnologia_para_social, hibrida, indefinida
- `anexo_tipo`: foto_capa, foto_secundaria_1, foto_secundaria_2, foto_galeria_extra, logo, video, documento_pdf, publicacao_academica, material_didatico, reportagem_midia, link_externo_outro
- `anexo_origem`: supabase_storage, link_externo
- `email_tipo`: confirmacao_submissao, notificacao_admin, aprovacao, rejeicao, solicitacao_atualizacao, lembrete_atualizacao, notificacao_inativacao
- `email_status`: pendente, enviado, entregue, falhou, bounced
- `convite_resposta`: ainda_ativa_sem_alteracoes, ainda_ativa_com_atualizacoes, encerrada, nao_respondido

---

## 6. Pendências e débitos técnicos identificados

| # | Item | Quando resolver |
|---|---|---|
| 1 | Gerar `seed_cnpq_completo.sql` com hierarquia oficial do Lattes (4 níveis) | Antes do go-live |
| 2 | Catálogo antigo em PDF — analisar mais exemplos para refinar estrutura editorial | Quando entrarmos no design |
| 3 | Definir as ~30 perguntas finais de pontuação (8 da Parte III + ~22 novas) com pesos definitivos | Após Rodada 3 |
| 4 | Logo e identidade visual do LISA | Antes da frente de design |
| 5 | Capacidade da equipe para revisão de tradução (estagiária + segunda revisão) | Antes do lançamento |
| 6 | Definir paleta de cores final + tipografia (referências glassmorfismo) | Frente de design |
| 7 | Decisão sobre tradução automática: DeepL Free vs Google Cloud Translation | Antes de implementar fluxo de tradução |

---

## 7. O que ainda falta decidir/fazer

### Schema do banco
- [ ] Ajustes finais da Rodada 2 (pendentes do usuário)
- [ ] Rodada 3 (admin, logs de moderação, configurações do sistema, views úteis)
- [ ] Diagrama DBML consolidado das 3 rodadas
- [ ] Listagem das ~30 perguntas de pontuação com pesos finais

### Conteúdo
- [ ] Coletar logo do portal
- [ ] Coletar referências visuais (Behance, Freepik, modelo de onboard de formulário)
- [ ] Coletar mais páginas do catálogo antigo

### Frontend (a iniciar após fechar banco)
- [ ] Mockup Home (catálogo + filtros + hero)
- [ ] Mockup Formulário multi-step de cadastro
- [ ] Mockup Página de experiência individual
- [ ] Mockup Painel admin de moderação
- [ ] Mockup Tela de login admin
- [ ] Decisão final de paleta + tipografia
- [ ] Componentes React reais para o projeto Next.js

### Backend (após mockups)
- [ ] Setup do projeto Next.js + Supabase
- [ ] Migração do schema para o Supabase
- [ ] Edge Functions para scoring, disparo de e-mail, integração DeepL
- [ ] Migração das ~110 experiências existentes (estagiária)

---

## 8. Como retomar este projeto em outra conversa

Se você precisar começar uma conversa nova com Claude no futuro (porque esta ficou longa demais ou porque o Claude começou a esquecer detalhes), faça assim:

1. Anexe **este documento** (`lisa_consolidacao.md`) na nova conversa
2. Anexe os **dois artigos teóricos** (`A_emergência_da_tecnologia_social.pdf` e `ABORDAGENS_TEÓRICAS_DE_TECNOLOGIA_SOCIAL_NO_BRASIL.pdf`)
3. Anexe o **formulário de registro 2025** (`Formulário_de_Registro_2025__Google_Formulários.pdf`)
4. Anexe o **arquivo de grandes áreas CNPq** (`Grandes_Áreas_CNPQ.txt`)
5. Anexe o **catálogo Cozinha CuidAR** ou outras páginas de catálogo que tiver
6. Diga: "Este é o estado atual do meu projeto LISA. Leia o documento de consolidação e me ajude a continuar de onde paramos. Próximo passo: [o que você quer fazer]."

Claude vai retomar o contexto rapidamente e a continuidade fica preservada.

---

**Fim do documento.**
