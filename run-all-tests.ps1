# Script para ejecutar todas las pruebas unitarias del proyecto QuickBite
# Autor: QuickBite Team
# Fecha: 17 de junio de 2026

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Ejecutando todas las pruebas QuickBite" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Contadores
$TOTAL_SERVICES = 0
$PASSED_SERVICES = 0
$FAILED_SERVICES = 0

# Función para ejecutar pruebas de un servicio
function Run-ServiceTests {
    param(
        [string]$SERVICE_NAME,
        [string]$SERVICE_PATH,
        [string]$TEST_COMMAND
    )
    
    Write-Host "------------------------------------------" -ForegroundColor Yellow
    Write-Host "Ejecutando pruebas: $SERVICE_NAME" -ForegroundColor Yellow
    Write-Host "------------------------------------------" -ForegroundColor Yellow
    
    Push-Location $SERVICE_PATH
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: No se puede acceder al directorio $SERVICE_PATH" -ForegroundColor Red
        $FAILED_SERVICES++
        $TOTAL_SERVICES++
        Pop-Location
        return
    }
    
    Invoke-Expression $TEST_COMMAND
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Pruebas de $SERVICE_NAME PASARON" -ForegroundColor Green
        $PASSED_SERVICES++
    } else {
        Write-Host "✗ Pruebas de $SERVICE_NAME FALLARON" -ForegroundColor Red
        $FAILED_SERVICES++
    }
    
    $TOTAL_SERVICES++
    Write-Host ""
    Pop-Location
}

# Ejecutar pruebas de servicios backend
Write-Host "=== SERVICIOS BACKEND ===" -ForegroundColor Cyan
Write-Host ""

Run-ServiceTests "Auth Service" "Backend\quickbite-Auth-main" "mvn test"
Run-ServiceTests "Inventory Service" "Backend\quickbite-ms-inventario" "mvn test"
Run-ServiceTests "Menu Service" "Backend\quickbite-menu-service" "mvn test"
Run-ServiceTests "Orders Service" "Backend\quickbite-pedidos-main" "mvn test"
Run-ServiceTests "Kitchen Service" "Backend\quickbite-kitchen-service" "mvn test"
Run-ServiceTests "Notifications Service" "Backend\quickbite-ms-notificaciones" "mvn test"
Run-ServiceTests "Payment Service" "Backend\quickbite-payment-service" "mvn test"
Run-ServiceTests "Eureka Server" "Backend\eureka-server" "mvn test"
Run-ServiceTests "API Gateway" "Backend\api-gateway" "mvn test"

# Ejecutar pruebas de frontend
Write-Host "=== FRONTEND ===" -ForegroundColor Cyan
Write-Host ""

Run-ServiceTests "Frontend React" "frontend" "npm test -- --watchAll=false --coverage"

# Resumen
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Total de servicios: $TOTAL_SERVICES"
Write-Host "Servicios pasados: $PASSED_SERVICES" -ForegroundColor Green
Write-Host "Servicios fallidos: $FAILED_SERVICES" -ForegroundColor Red
Write-Host ""

if ($FAILED_SERVICES -eq 0) {
    Write-Host "¡TODAS LAS PRUEBAS PASARON!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "ALGUNAS PRUEBAS FALLARON" -ForegroundColor Red
    exit 1
}
