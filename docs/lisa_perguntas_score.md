# Portal LISA — Sistema Fuzzy de Avaliação de Tecnologias Sociais

**Nome do instrumento:** EFITS — Escala Fuzzy de Identificação de Tecnologias Sociais
**Versão:** 2.0 (substitui completamente o modelo determinístico anterior)
**Data:** abril/2026
**Autoria metodológica:** Profa. Dra. Elaine Sigette (coordenadora) + referencial Dagnino/ITS
**Total de perguntas:** 20 (4 por dimensão × 5 dimensões)
**Escala de resposta:** contínua de 0 a 10

---

## Por que mudamos do modelo binário para o fuzzy

O modelo anterior usava 30 perguntas booleanas (Sim/Não) com pesos que somavam um score de 0 a 100. Esse modelo tinha uma limitação fundamental: **forçava uma decisão binária sobre fenômenos sociais que são inerentemente graduais**. Uma experiência não é "é tecnologia social" ou "não é" — ela tem um **grau de aderência** ao conceito, que pode variar em cada dimensão.

O modelo fuzzy resolve isso de três formas:

1. **Escala contínua (0 a 10)** em cada pergunta, capturando a nuance do "mais ou menos"
2. **Funções de pertinência com sobreposição** (baixo/médio/alto), refletindo que classificações sociais não têm fronteiras rígidas
3. **Regras de inferência linguísticas** (SE–ENTÃO) que combinam as dimensões de forma não-linear, capturando combinações híbridas realistas

Além disso, o modelo fuzzy tem um **valor formativo**: o coordenador que preenche o formulário reflete sobre em quais dimensões sua experiência é forte ou fraca, em vez de simplesmente marcar caixas. O portal se torna também uma ferramenta pedagógica.

O resultado final é um **índice de 0 a 1** representado por uma **escala cromática contínua** (vermelho → amarelo → verde), que classifica a experiência como:
- 🔴 **Vermelho** (0.0 – 0.3) — Não é tecnologia social (provável rejeição ou reorientação)
- 🟡 **Amarelo** (0.3 – 0.7) — Potencial / em transição (aceita, mas com observações)
- 🟢 **Verde** (0.7 – 1.0) — Tecnologia social consolidada (alta aderência)

---

## As 5 dimensões de entrada

| Código | Dimensão | Peso | O que avalia |
|---|---|---|---|
| **P** | Participação Comunitária | 0.30 | Envolvimento real da comunidade nas decisões |
| **I** | Impacto Social | 0.25 | Transformação concreta percebida pelos beneficiários |
| **A** | Apropriação Tecnológica | 0.20 | Autonomia da comunidade sobre a tecnologia |
| **S** | Sustentabilidade | 0.15 | Capacidade de manutenção no longo prazo |
| **R** | Replicabilidade | 0.10 | Adaptabilidade a outros contextos |

**Os pesos são fixos no MVP** e representam decisão política do projeto LISA sobre o que é mais importante na caracterização de uma tecnologia social. Eles refletem a ênfase do referencial Dagnino/ITS na participação e no impacto como eixos centrais.

---

## As 20 perguntas do instrumento (escala 0-10)

### Dimensão 1 — Participação Comunitária (P) — peso 0.30

| Código | Pergunta |
|---|---|
| **P1** | A comunidade participa das decisões do projeto |
| **P2** | Os beneficiários influenciam diretamente o funcionamento |
| **P3** | Há espaços coletivos de deliberação |
| **P4** | O projeto é construído com a comunidade, e não para ela |

### Dimensão 2 — Impacto Social (I) — peso 0.25

| Código | Pergunta |
|---|---|
| **I1** | O projeto melhora as condições de vida da comunidade |
| **I2** | Há evidências concretas de transformação social |
| **I3** | O projeto reduz desigualdades locais |
| **I4** | O impacto é percebido pelos beneficiários |

### Dimensão 3 — Apropriação Tecnológica (A) — peso 0.20

| Código | Pergunta |
|---|---|
| **A1** | A comunidade entende como o projeto funciona |
| **A2** | Os usuários conseguem operar a tecnologia de forma autônoma |
| **A3** | O conhecimento técnico é compartilhado |
| **A4** | Há independência de especialistas externos |

### Dimensão 4 — Sustentabilidade (S) — peso 0.15

| Código | Pergunta |
|---|---|
| **S1** | O projeto consegue se manter ao longo do tempo |
| **S2** | Há autonomia financeira ou organizacional |
| **S3** | O projeto resiste a mudanças externas |
| **S4** | Existem estratégias de continuidade |

### Dimensão 5 — Replicabilidade (R) — peso 0.10

| Código | Pergunta |
|---|---|
| **R1** | O projeto pode ser adaptado para outros contextos |
| **R2** | A metodologia é documentada |
| **R3** | Outros grupos conseguem reproduzir a iniciativa |
| **R4** | O modelo é flexível a diferentes realidades |

**Forma de resposta:** cada pergunta é respondida em uma escala contínua de 0 a 10, apresentada visualmente como um slider/régua no formulário. Os valores 0 e 10 recebem rótulos âncora:

- **0** = característica inexistente / ausência total
- **10** = característica plenamente manifestada

Valores intermediários representam graus contínuos de manifestação.

---

## Campos abertos por dimensão (conteúdo editorial)

Ao final das 4 perguntas de cada dimensão, o coordenador encontra um campo aberto opcional:

> *"Conte brevemente como esta dimensão se manifesta na sua experiência (opcional, até 1.000 caracteres)."*

Total: **5 campos abertos**, um por dimensão. Esses textos:
- Aparecem no painel admin durante a moderação
- Podem ser editados pela equipe editorial
- Podem compor conteúdo editorial adicional no catálogo (a critério da moderação)
- Não afetam o cálculo do índice fuzzy

---

## Funções de Pertinência

Cada variável de entrada (P, I, A, S, R) é classificada em 3 conjuntos linguísticos com **sobreposição proposital** (característica fundamental da lógica fuzzy):

### Funções triangulares

```
Baixo (B):   pico em 0,  decresce até 4
Médio (M):   começa em 3, pico em 5,  termina em 7
Alto (A):    começa em 6, pico em 10
```

Em fórmula matemática:

```
μ_baixo(x)  = max(0, min(1, (4 - x) / 4))
μ_medio(x)  = max(0, min((x - 3) / 2, (7 - x) / 2))
μ_alto(x)   = max(0, min(1, (x - 6) / 4))
```

**Exemplo:** uma resposta com valor **5** tem:
- Pertinência no conjunto "Baixo" ≈ 0 (está fora do triângulo)
- Pertinência no conjunto "Médio" ≈ 1.0 (está no pico)
- Pertinência no conjunto "Alto" ≈ 0 (está fora do triângulo)

Uma resposta com valor **6.5** tem:
- Pertinência no conjunto "Médio" ≈ 0.25
- Pertinência no conjunto "Alto" ≈ 0.125
- (ambiguidade capturada pela sobreposição)

---

## Regras Fuzzy (motor de inferência)

### Estrutura geral

- Participação (P) + Impacto (I) = eixo principal
- Apropriação (A) = validação social da tecnologia
- Sustentabilidade (S) + Replicabilidade (R) = maturidade

### Regras de Baixa Aderência (saída: Baixo)

**Núcleo crítico (ausência estrutural):**
```
SE P é Baixo E I é Baixo             → TS é Baixo
SE P é Baixo E A é Baixo             → TS é Baixo
SE I é Baixo E S é Baixo             → TS é Baixo
SE P é Baixo E R é Baixo             → TS é Baixo
```

**Dominância negativa:**
```
SE P é Baixo E I é Médio             → TS é Baixo
SE I é Baixo E P é Médio             → TS é Baixo
SE A é Baixo E I é Médio             → TS é Baixo
```

### Regras de Média Aderência (saída: Médio)

**Situações intermediárias:**
```
SE P é Médio E I é Médio             → TS é Médio
SE P é Médio E I é Alto              → TS é Médio
SE P é Alto E I é Médio              → TS é Médio
```

**Compensações:**
```
SE I é Alto E P é Baixo              → TS é Médio
SE P é Alto E A é Médio              → TS é Médio
SE S é Alto E R é Baixo              → TS é Médio
SE R é Alto E S é Baixo              → TS é Médio
```

**Falha de apropriação:**
```
SE A é Baixo E P é Alto              → TS é Médio
SE A é Baixo E I é Alto              → TS é Médio
```

**Maturidade parcial:**
```
SE P é Médio E A é Médio E S é Médio → TS é Médio
SE I é Alto E A é Médio              → TS é Médio
SE P é Alto E S é Médio              → TS é Médio
```

### Regras de Alta Aderência (saída: Alto)

**Núcleo forte:**
```
SE P é Alto E I é Alto E A é Alto                  → TS é Alto
```

**Com maturidade ampliada:**
```
SE P é Alto E I é Alto E S é Alto                  → TS é Alto
SE P é Alto E I é Alto E R é Alto                  → TS é Alto
```

**Rede completa:**
```
SE P é Alto E I é Alto E A é Alto E S é Alto       → TS é Alto
SE P é Alto E I é Alto E A é Alto E R é Alto       → TS é Alto
```

**Equilíbrio geral:**
```
SE P é Alto E I é Alto E A é Médio E S é Médio     → TS é Alto
```

**Robustez:**
```
SE P é Médio E I é Alto E A é Alto                 → TS é Alto
SE P é Alto E I é Médio E A é Alto                 → TS é Alto
```

### Regras de Ajuste (refinamento)

**Evitar falsos positivos:**
```
SE P é Alto E I é Alto E A é Baixo   → TS é Médio
```

**Evitar falso "verde" por um único fator:**
```
SE apenas I é Alto                   → TS é Médio
SE apenas P é Alto                   → TS é Médio
```

**Interpretação sociotécnica das regras:**
- não basta impacto → precisa participação
- não basta tecnologia → precisa apropriação
- não basta inovação → precisa sustentabilidade

---

## Cálculo do Índice (defuzzificação)

O motor fuzzy no MVP usa uma abordagem simplificada de **inferência Mamdani com defuzzificação por média ponderada**, mais leve que a defuzzificação por centroide e adequada à aplicação web.

### Algoritmo

```
1. Para cada entrada (P, I, A, S, R), calcular as 3 pertinências
   (μ_baixo, μ_medio, μ_alto).

2. Para cada regra fuzzy, calcular a ativação:
   ativação = min(pertinências das condições da regra)

3. Agregar todas as regras com mesmo consequente:
   baixo_score = max(ativações de todas as regras → Baixo)
   medio_score = max(ativações de todas as regras → Médio)
   alto_score  = max(ativações de todas as regras → Alto)

4. Defuzzificar por média ponderada:
   índice = (baixo_score × 0.2 + medio_score × 0.5 + alto_score × 0.9)
          / (baixo_score + medio_score + alto_score + ε)

5. Classificar por cor:
   0.0 – 0.3 → Vermelho
   0.3 – 0.7 → Amarelo
   0.7 – 1.0 → Verde
```

### Validação cruzada pela fórmula linear ponderada

Como segunda referência, o sistema também calcula um **índice linear simples** usando os pesos das dimensões:

```
índice_linear = (P̄ × 0.30 + Ī × 0.25 + Ā × 0.20 + S̄ × 0.15 + R̄ × 0.10) / 10
```

Onde P̄, Ī, Ā, S̄, R̄ são as médias das 4 perguntas de cada dimensão. Esse índice serve como **referência cruzada** para o painel admin. Diferenças grandes entre o índice fuzzy e o linear são sinal de que a experiência tem perfil híbrido/ambíguo, merecendo leitura cuidadosa da moderação.

---

## Implementação técnica

### Lado do cliente (formulário de cadastro)

- Cada pergunta é apresentada como um **slider de 0 a 10** com passo de 0.5 (21 valores possíveis)
- Cada slider tem **ancoragem textual** nos extremos ("Inexistente" / "Plenamente manifestado")
- Um **valor numérico** é exibido em tempo real ao lado do slider
- Ao final de cada dimensão, o coordenador vê o campo aberto opcional (1.000 caracteres)

### Lado do servidor (cálculo)

- Implementado em **TypeScript puro**, sem dependências externas
- Funções `baixo(x)`, `medio(x)`, `alto(x)` implementam as funções de pertinência triangulares
- Motor de inferência aplica as regras e calcula os três agregados
- Defuzzificação por média ponderada retorna o índice 0-1
- Resultado é armazenado em `avaliacao_fuzzy` (ver schema)

### Não será implementado no MVP

- Validação estatística (Alfa de Cronbach, AFE, AFC) — fica para equipe de pesquisa, fora do código do portal
- Integração com SPSS ou R — fora do escopo do portal web
- Análises comparativas multi-projeto no painel admin (v2)

### O que será implementado no painel admin (MVP)

- Visualização do índice fuzzy + índice linear para cada experiência
- Exibição de cada dimensão separadamente com barra visual
- **Exportação em CSV** de todas as respostas cruas para uso externo em SPSS/R pela equipe de pesquisa

---

## Notas importantes para a coordenação

1. **Os pesos das dimensões são fixos no MVP** e estão definidos no código. Eventuais ajustes exigem decisão metodológica documentada e novo deploy.

2. **As 20 perguntas são editáveis** via painel admin (tabela `pergunta_fuzzy`), permitindo calibração do texto sem redeploy. Mudanças no número total de perguntas exigem ajuste de código.

3. **O catálogo aceita experiências de todas as faixas cromáticas** (vermelho, amarelo, verde). A decisão de publicar é sempre humana — o índice fuzzy apenas organiza a fila de moderação e informa a decisão.

4. **O índice é apenas um auxílio à reflexão**, não um veredito automático. Toda aprovação/rejeição é feita por revisores humanos.

5. **A validação científica do instrumento (EFITS)** é um trabalho de pesquisa acadêmica que será realizado **separadamente**, pela equipe de pesquisa, usando dados exportados do portal em SPSS ou R. Isso não faz parte do código do portal web.

---

## Apêndice A — Exemplo de cálculo

**Projeto hipotético com respostas:**
- P1=8, P2=7, P3=9, P4=8  → P̄ = 8.0
- I1=7, I2=7, I3=8, I4=6  → Ī = 7.0
- A1=6, A2=6, A3=7, A4=5  → Ā = 6.0
- S1=5, S2=5, S3=6, S4=4  → S̄ = 5.0
- R1=6, R2=7, R3=5, R4=6  → R̄ = 6.0

**Pertinências:**
- P̄=8.0 → μ_baixo=0, μ_medio=0, μ_alto=0.5
- Ī=7.0 → μ_baixo=0, μ_medio=0, μ_alto=0.25
- Ā=6.0 → μ_baixo=0, μ_medio=0.5, μ_alto=0
- S̄=5.0 → μ_baixo=0, μ_medio=1.0, μ_alto=0
- R̄=6.0 → μ_baixo=0, μ_medio=0.5, μ_alto=0

**Aplicação de regras** (só as ativadas):
- "SE P alto E I alto E A médio E S médio → Alto" → min(0.5, 0.25, 0.5, 1.0) = 0.25
- "SE P alto E A médio → Médio" → min(0.5, 0.5) = 0.5
- (outras regras com ativação baixa)

**Defuzzificação aproximada:**
- alto_score ≈ 0.25
- medio_score ≈ 0.5
- baixo_score ≈ 0
- índice = (0 × 0.2 + 0.5 × 0.5 + 0.25 × 0.9) / (0 + 0.5 + 0.25)
- índice ≈ (0.25 + 0.225) / 0.75 ≈ **0.63**

**Índice linear (referência cruzada):**
- (8.0 × 0.30 + 7.0 × 0.25 + 6.0 × 0.20 + 5.0 × 0.15 + 6.0 × 0.10) / 10
- = (2.4 + 1.75 + 1.2 + 0.75 + 0.6) / 10 = **0.67**

**Classificação final:** Amarelo (em transição para tecnologia social consolidada)

O projeto recebe leitura cuidadosa da moderação, com observação de que as dimensões de Apropriação (A) e Sustentabilidade (S) estão no limite inferior da média e merecem atenção.

---

**Fim do documento EFITS v2.0.**
