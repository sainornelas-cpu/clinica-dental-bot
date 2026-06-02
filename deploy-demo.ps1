# deploy-demo.ps1 - Deploy rápido para actualizar el demo
param(
    [string]$msg = "🎨 Demo: actualizar para cliente"
)

Write-Host "🚀 Iniciando deploy del demo..." -ForegroundColor Cyan

git add client/src/data/demo-config.js
git commit -m "$msg"
git push origin main

Write-Host "✅ Deploy enviado. Esperar ~2 min en Railway..." -ForegroundColor Green
Write-Host "🔗 Demo: https://clinica-dental-bot-production.up.railway.app/demo" -ForegroundColor Yellow
