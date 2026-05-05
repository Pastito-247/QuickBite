# QuickBite Deployment Script (PowerShell)
# Este script automatiza el despliegue de toda la arquitectura de microservicios

Write-Host "🚀 Iniciando despliegue de QuickBite..." -ForegroundColor Green

# Verificar que Docker esté instalado
try {
    docker --version | Out-Null
    Write-Host "✅ Docker encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado. Por favor, instale Docker Desktop primero." -ForegroundColor Red
    exit 1
}

# Verificar que Docker Compose esté instalado
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose no está instalado. Por favor, instale Docker Compose primero." -ForegroundColor Red
    exit 1
}

# Preguntar si desea limpiar contenedores anteriores
$clean = Read-Host "¿Desea limpiar contenedores anteriores? (y/n)"
if ($clean -eq 'y' -or $clean -eq 'Y') {
    Write-Host "🧹 Limpiando contenedores anteriores..." -ForegroundColor Yellow
    docker-compose down -v
    docker system prune -f
}

# Construir las imágenes
Write-Host "🔨 Construyendo imágenes Docker..." -ForegroundColor Blue
docker-compose build --no-cache

# Iniciar los servicios
Write-Host "🔄 Iniciando servicios..." -ForegroundColor Blue
docker-compose up -d

# Esperar a que los servicios estén listos
Write-Host "⏳ Esperando a que los servicios inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verificar el estado de los servicios
Write-Host "📊 Verificando estado de los servicios..." -ForegroundColor Green
docker-compose ps

# Mostrar logs de los servicios principales
Write-Host "📋 Mostrando logs de servicios principales..." -ForegroundColor Cyan
Write-Host "--- API Gateway ---" -ForegroundColor White
docker-compose logs --tail=20 api-gateway

Write-Host "--- Eureka Server ---" -ForegroundColor White
docker-compose logs --tail=10 eureka-server

Write-Host "--- Frontend ---" -ForegroundColor White
docker-compose logs --tail=10 frontend

# Mostrar URLs de acceso
Write-Host ""
Write-Host "✅ Despliegue completado!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs de acceso:" -ForegroundColor Cyan
Write-Host "   Frontend:           http://localhost:3000"
Write-Host "   API Gateway:        http://localhost:8080"
Write-Host "   Eureka Dashboard:   http://localhost:8761"
Write-Host ""
Write-Host "🔑 Credenciales de prueba:" -ForegroundColor Yellow
Write-Host "   Admin:  admin@quickbite.com / admin123"
Write-Host "   Cocina: kitchen@quickbite.com / kitchen123"
Write-Host "   Cliente: customer@quickbite.com / customer123"
Write-Host ""
Write-Host "📝 Para ver logs en tiempo real:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f [nombre-servicio]"
Write-Host ""
Write-Host "🛑 Para detener todos los servicios:" -ForegroundColor Red
Write-Host "   docker-compose down"
