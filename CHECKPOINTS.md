# 💾 Checkpoints — Guia de Versionamento Local

> Sistema de controle de versão local para rastrear e reverter mudanças do projeto Portal LISA com facilidade.

---

## ⚡ Quick Start

### Criar um Checkpoint (Salvar Progresso)

Sempre que você faz mudanças importantes:

```powershell
.\checkpoint.ps1 "descrição do que foi feito"
```

**Exemplos:**
```powershell
.\checkpoint.ps1 "implementei filtro de busca no catálogo"
.\checkpoint.ps1 "corrigir bug de navegação mobile"
.\checkpoint.ps1 "atualizar cores do design system"
.\checkpoint.ps1 "adicionar campo telefone ao formulário"
```

✅ **Pronto!** Seu progresso foi salvo. Você pode reverter para este ponto a qualquer momento.

---

## 📋 Ver Histórico de Checkpoints

Para ver todos os checkpoints que já criou:

```bash
git log --oneline
```

**Retorna algo como:**
```
a1b2c3d checkpoint: implementei filtro de busca no catálogo
d4e5f6g checkpoint: corrigir bug de navegação mobile
8h9i0jk checkpoint: atualizar cores do design system
1ab966c docs: adicionar seção de checkpoints ao QUICK_START
13d0487 chore: inicializar repositório git — snapshot inicial
```

### Ver Detalhes de um Checkpoint

```bash
git show a1b2c3d
```

Mostra exatamente o que foi modificado naquele checkpoint.

---

## 🔙 Voltar para um Checkpoint Anterior

### Opção 1: Apenas Inspecionar (Seguro — Somente Leitura)

Se você quer **ver como o projeto era** em um checkpoint específico, sem fazer alterações permanentes:

```bash
git checkout a1b2c3d
```

**O que acontece:**
- Você entra em modo "detached HEAD"
- Pode inspecionar arquivos, rodar o app, ver o código
- Nenhuma mudança permanente é feita

**Para voltar ao presente:**
```bash
git checkout master
```

### Opção 2: Reverter Permanentemente (Destrutivo)

Se você quer **descartar tudo que fez após um checkpoint** e voltar para aquele estado:

```bash
git reset --hard a1b2c3d
```

⚠️ **AVISO:** Este comando é **destrutivo**!
- Descarta **todas** as mudanças feitas após `a1b2c3d`
- Não pode ser desfeito (a não ser que você saiba o hash do commit que descartou)
- Use apenas quando **tiver certeza absoluta**

---

## 📁 Estrutura do Git Local

```
Portal LISA/
├── .git/                    ← Repositório git (histórico)
├── .gitignore              ← Regras do que ignorar
├── checkpoint.ps1          ← Script para criar checkpoints
├── CHECKPOINTS.md          ← Este arquivo
├── QUICK_START.md
├── CLAUDE.md
├── docs/
├── portal-lisa-app/        ← Sua aplicação
├── mockups/
├── supabase/
└── ...
```

---

## 🎯 Boas Práticas

### ✅ Crie checkpoints frequentemente

- Após implementar uma feature
- Depois de corrigir um bug
- Antes de fazer refactoring grande
- Ao fim de cada sessão de trabalho

**Dica:** Pequenos checkpoints são melhor que poucos grandes. Se precisar reverter, você volta apenas o necessário.

### ✅ Use descrições claras

```powershell
# ✅ Bom
.\checkpoint.ps1 "adicionar validação de email no cadastro"
.\checkpoint.ps1 "corrigir alinhamento do menu responsivo"

# ❌ Ruim
.\checkpoint.ps1 "ajustes"
.\checkpoint.ps1 "mudanças"
.\checkpoint.ps1 "fix"
```

### ✅ Revise antes de reverter

Se vai usar `git reset --hard`, primeiro veja o que vai descartar:

```bash
git log --oneline           # vê todos os checkpoints
git show a1b2c3d            # vê exatamente o que foi feito
git diff a1b2c3d            # vê diferença entre agora e a1b2c3d
```

---

## 🛠️ Comandos Úteis

| Comando | O que faz |
|---------|-----------|
| `git log --oneline` | Lista todos os checkpoints |
| `git log --oneline -5` | Lista últimos 5 checkpoints |
| `git show <hash>` | Mostra mudanças do checkpoint |
| `git diff <hash>` | Mostra diferença entre agora e checkpoint |
| `git status` | Mostra arquivos modificados não salvos |
| `git checkout <hash>` | Volta para ver um checkpoint (seguro) |
| `git checkout master` | Volta ao presente |
| `git reset --hard <hash>` | Volta e descarta tudo após checkpoint (destrutivo) |

---

## ❓ Perguntas Frequentes

### P: E se eu clicar `git reset --hard` por engano?

R: Não há "desfazer" para um `reset --hard`. Por isso:
- Use `git checkout` para inspecionar (seguro)
- Use `git reset --hard` apenas quando 100% seguro
- Se descartou algo importante, você pode recuperar se souber o hash do commit perdido (`git reflog`)

### P: Posso compartilhar esse repositório git?

R: Este é um **repositório local**. Para compartilhar com outras pessoas, você precisaria:
1. Criar um repositório remoto (GitHub, GitLab, etc.)
2. Fazer `git push` para lá

Por enquanto, é apenas local na sua máquina.

### P: Quanto espaço o git ocupa?

R: Muito pouco. O diretório `.git/` é pequeno (alguns MB). Não afeta o tamanho do projeto significativamente.

### P: Posso usar comandos git diretamente?

R: Sim! O script `checkpoint.ps1` é apenas um atalho. Você pode usar git normalmente:

```bash
git add -A
git commit -m "seu-mensagem"
git log
git reset --hard <hash>
# etc...
```

---

## 📚 Recursos Adicionais

- [QUICK_START.md](./QUICK_START.md) — Guia de deploy
- [Git Documentation](https://git-scm.com/doc) — Documentação oficial do Git
- [Conventional Commits](https://www.conventionalcommits.org/) — Padrão de mensagens de commit

---

## 🎉 Resumo

**Para cada mudança importante:**

```powershell
# Fazer suas mudanças...
# ...

# Quando terminar, salvar:
.\checkpoint.ps1 "descrição clara do que você fez"

# Pronto! Você pode sempre voltar para este ponto:
git log --oneline              # ver histórico
git checkout <hash>            # inspecionar
git reset --hard <hash>        # reverter (cuidado!)
```

**Boa sorte com o Portal LISA! 🚀**
