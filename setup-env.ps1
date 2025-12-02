# PowerShell script to set up environment files
# Run this from the project root: .\setup-env.ps1

Write-Host "Setting up environment files..." -ForegroundColor Green

# Backend .env
if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
} else {
    Write-Host "⚠️  backend/.env already exists, skipping..." -ForegroundColor Yellow
}

# Frontend .env
if (-not (Test-Path "frontend\.env")) {
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Host "✅ Created frontend/.env" -ForegroundColor Green
} else {
    Write-Host "⚠️  frontend/.env already exists, skipping..." -ForegroundColor Yellow
}

Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env and add your MongoDB URI" -ForegroundColor White
Write-Host "2. Edit frontend/.env and update API URLs after deployment" -ForegroundColor White
Write-Host "3. Run 'npm install' in both backend and frontend folders" -ForegroundColor White


