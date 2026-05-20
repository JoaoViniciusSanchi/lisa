# Script de checkpoint — cria um snapshot versionado do projeto
# Uso: .\checkpoint.ps1 "descrição da mudança"
# Exemplo: .\checkpoint.ps1 "implementei filtro de busca no catálogo"

param(
    [string]$Message = "snapshot sem descrição"
)

Write-Host "🔄 Criando checkpoint..." -ForegroundColor Cyan
git add -A
git commit -m "checkpoint: $Message"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Checkpoint criado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Comandos úteis:" -ForegroundColor Yellow
    Write-Host "  git log --oneline             # ver histórico"
    Write-Host "  git show <hash>               # inspecionar um commit"
    Write-Host "  git checkout <hash>           # voltar para um ponto (somente leitura)"
    Write-Host "  git reset --hard <hash>       # voltar e descartar mudanças"
}
else {
    Write-Host "❌ Erro ao criar checkpoint. Nenhuma mudança detectada?" -ForegroundColor Red
}
