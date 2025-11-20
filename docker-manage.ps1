
# Script para gestionar el stack de Docker

param(
    [Parameter(Position=0)]
    [ValidateSet('up', 'down', 'restart', 'logs', 'build', 'clean', 'status', 'help')]
    [string]$Command = 'help'
)

$ComposeFile = "docker-compose.yml"

function Show-Help {
    Write-Host "`n=== AR ART GALLERY - DOCKER COMMANDS ===" -ForegroundColor Cyan
    Write-Host "`nUso: .\docker-manage.ps1 [comando]" -ForegroundColor Yellow
    Write-Host "`nComandos disponibles:" -ForegroundColor White
    Write-Host "  up       - Levanta todos los servicios" -ForegroundColor Green
    Write-Host "  down     - Detiene y elimina todos los servicios" -ForegroundColor Red
    Write-Host "  restart  - Reinicia todos los servicios" -ForegroundColor Yellow
    Write-Host "  logs     - Muestra logs de todos los servicios" -ForegroundColor Cyan
    Write-Host "  build    - Reconstruye las imágenes" -ForegroundColor Magenta
    Write-Host "  clean    - Limpia volúmenes y red (CUIDADO: borra datos)" -ForegroundColor Red
    Write-Host "  status   - Muestra estado de servicios" -ForegroundColor White
    Write-Host "  help     - Muestra esta ayuda" -ForegroundColor Gray
    Write-Host ""
}

function Start-Services {
    Write-Host "`nIniciando servicios..." -ForegroundColor Green
    docker-compose -f $ComposeFile up -d --build
    Write-Host "`nServicios iniciados. Verificando estado..." -ForegroundColor Green
    Start-Sleep -Seconds 3
    docker-compose -f $ComposeFile ps
    Write-Host "`nServicios disponibles:" -ForegroundColor Cyan
    Write-Host "  API Gateway:  http://localhost:3000" -ForegroundColor White
    Write-Host "  Auth Service: http://localhost:3001" -ForegroundColor White
    Write-Host "  Composition:  http://localhost:3002" -ForegroundColor White
    Write-Host "  Museum Proxy: http://localhost:3010" -ForegroundColor White
    Write-Host "  MET Adapter:  http://localhost:3012" -ForegroundColor White
    Write-Host "  Harvard:      http://localhost:3013" -ForegroundColor White
    Write-Host "`n  MongoDB:      localhost:27017" -ForegroundColor Gray
    Write-Host "  Redis:        localhost:6379" -ForegroundColor Gray
    Write-Host "`nSwagger disponible en:" -ForegroundColor Cyan
    Write-Host "  http://localhost:3000/api/docs (API Gateway)" -ForegroundColor Yellow
}

function Stop-Services {
    Write-Host "`nDeteniendo servicios..." -ForegroundColor Red
    docker-compose -f $ComposeFile down
    Write-Host "`nServicios detenidos." -ForegroundColor Green
}

function Restart-Services {
    Write-Host "`nReiniciando servicios..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile restart
    Write-Host "`nServicios reiniciados." -ForegroundColor Green
}

function Show-Logs {
    Write-Host "`nMostrando logs (Ctrl+C para salir)..." -ForegroundColor Cyan
    docker-compose -f $ComposeFile logs -f
}

function Build-Services {
    Write-Host "`nReconstruyendo imágenes..." -ForegroundColor Magenta
    docker-compose -f $ComposeFile build --no-cache
    Write-Host "`nImágenes reconstruidas." -ForegroundColor Green
}

function Clean-All {
    Write-Host "`nADVERTENCIA: Esto eliminará todos los volúmenes (datos de MongoDB y Redis)" -ForegroundColor Red
    $confirm = Read-Host "¿Estás seguro? (yes/no)"
    if ($confirm -eq 'yes') {
        Write-Host "`nLimpiando..." -ForegroundColor Red
        docker-compose -f $ComposeFile down -v
        Write-Host "`nLimpieza completada." -ForegroundColor Green
    } else {
        Write-Host "`nOperación cancelada." -ForegroundColor Yellow
    }
}

function Show-Status {
    Write-Host "`nEstado de servicios:" -ForegroundColor Cyan
    docker-compose -f $ComposeFile ps
}

# Ejecutar comando
switch ($Command) {
    'up'      { Start-Services }
    'down'    { Stop-Services }
    'restart' { Restart-Services }
    'logs'    { Show-Logs }
    'build'   { Build-Services }
    'clean'   { Clean-All }
    'status'  { Show-Status }
    'help'    { Show-Help }
    default   { Show-Help }
}
