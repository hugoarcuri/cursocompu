# Script de configuración del proyecto
Write-Host "=== Configuración del Sistema de Gestión - Curso de Computación ===" -ForegroundColor Cyan

# 1. Instalar dependencias
Write-Host "`n[1/4] Instalando dependencias..." -ForegroundColor Yellow
npm install

# 2. Verificar archivo .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "`n[2/4] Creando .env.local desde plantilla..." -ForegroundColor Yellow
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "⚠  EDITÁ .env.local con tus credenciales de Supabase:" -ForegroundColor Red
    Write-Host "   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co"
    Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key"
} else {
    Write-Host "`n[2/4] .env.local ya existe ✅" -ForegroundColor Yellow
}

# 3. Schema SQL
Write-Host "`n[3/4] Recordatorio: Ejecutá el schema SQL en Supabase" -ForegroundColor Yellow
Write-Host "   Abrí supabase/schema.sql y ejecutalo en el SQL Editor de Supabase"

# 4. Iniciar servidor
Write-Host "`n[4/4] Iniciando servidor de desarrollo..." -ForegroundColor Green
Write-Host "   Abrí http://localhost:3000 en tu navegador`n" -ForegroundColor Cyan

npm run dev:webpack
