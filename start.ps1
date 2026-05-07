# QuickBite - Script de Inicio Local Simple

Write-Host "Iniciando QuickBite - Modo Evaluacion Local" -ForegroundColor Green

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js no esta instalado" -ForegroundColor Red
    exit 1
}

# Verificar Java
try {
    $javaVersion = java -version 2>&1
    Write-Host "Java encontrado" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Java no esta instalado" -ForegroundColor Red
    exit 1
}

# Verificar Maven
try {
    $mavenVersion = mvn --version
    Write-Host "Maven encontrado" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Maven no esta instalado" -ForegroundColor Red
    exit 1
}

Write-Host "Instalando dependencias del frontend..." -ForegroundColor Blue
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Error al instalar dependencias del frontend" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host "Compilando microservicios..." -ForegroundColor Blue

# Funcion para compilar
function Compile-Service($servicePath, $serviceName) {
    Write-Host "Compilando $serviceName..." -ForegroundColor Cyan
    Set-Location $servicePath
    mvn clean compile -q
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Error al compilar $serviceName" -ForegroundColor Red
        Set-Location ..
        Set-Location ..
        exit 1
    }
    Set-Location ..
    Set-Location ..
}

# Compilar servicios
Compile-Service "Backend\quickbite-Auth-main" "Auth Service"
Compile-Service "Backend\quickbite-ms-inventario" "Inventory Service"
Compile-Service "Backend\quickbite-menu-service" "Menu Service"
Compile-Service "Backend\quickbite-pedidos-main" "Order Service"
Compile-Service "Backend\quickbite-payment-service" "Payment Service"
Compile-Service "Backend\quickbite-kitchen-service" "Kitchen Service"
Compile-Service "Backend\quickbite-ms-notificaciones" "Notification Service"
Compile-Service "backend\api-gateway" "API Gateway"
Compile-Service "backend\eureka-server" "Eureka Server"

Write-Host "Iniciando servicios..." -ForegroundColor Blue

# Crear directorio para logs
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
}

# Iniciar Eureka Server
Write-Host "Iniciando Eureka Server (puerto 8761)..." -ForegroundColor Cyan
Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run", "-Dspring-boot.run.jvmArguments=-Dserver.port=8761" -WorkingDirectory "backend\eureka-server" -RedirectStandardOutput "logs\eureka.log" -RedirectStandardError "logs\eureka-error.log"
Start-Sleep -Seconds 10

# Iniciar API Gateway
Write-Host "Iniciando API Gateway (puerto 8080)..." -ForegroundColor Cyan
Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run", "-Dspring-boot.run.jvmArguments=-Dserver.port=8080" -WorkingDirectory "backend\api-gateway" -RedirectStandardOutput "logs\gateway.log" -RedirectStandardError "logs\gateway-error.log"
Start-Sleep -Seconds 15

# Iniciar microservicios
$services = @(
    @{Path = "Backend\quickbite-Auth-main"; Name = "Auth Service"; Port = 8081},
    @{Path = "Backend\quickbite-ms-inventario"; Name = "Inventory Service"; Port = 8082},
    @{Path = "Backend\quickbite-menu-service"; Name = "Menu Service"; Port = 8083},
    @{Path = "Backend\quickbite-pedidos-main"; Name = "Order Service"; Port = 8084},
    @{Path = "Backend\quickbite-payment-service"; Name = "Payment Service"; Port = 8085},
    @{Path = "Backend\quickbite-kitchen-service"; Name = "Kitchen Service"; Port = 8086},
    @{Path = "Backend\quickbite-ms-notificaciones"; Name = "Notification Service"; Port = 8087}
)

foreach ($service in $services) {
    Write-Host "Iniciando $($service.Name) (puerto $($service.Port))..." -ForegroundColor Cyan
    $logFile = "logs\$($service.Name -replace ' ', '-').log"
    $errorFile = "logs\$($service.Name -replace ' ', '-').error.log"
    Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run", "-Dspring-boot.run.jvmArguments=-Dserver.port=$($service.Port)" -WorkingDirectory $service.Path -RedirectStandardOutput $logFile -RedirectStandardError $errorFile
    Start-Sleep -Seconds 5
}

# Iniciar frontend
Write-Host "Iniciando Frontend (puerto 3000)..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "frontend" -RedirectStandardOutput "logs\frontend.log" -RedirectStandardError "logs\frontend-error.log"

Write-Host "Esperando que todos los servicios inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "QuickBite esta iniciando..." -ForegroundColor Green
Write-Host ""
Write-Host "URLs de acceso:" -ForegroundColor Cyan
Write-Host "   Frontend:           http://localhost:3000" -ForegroundColor White
Write-Host "   API Gateway:        http://localhost:8080" -ForegroundColor White
Write-Host "   Eureka Dashboard:   http://localhost:8761" -ForegroundColor White
Write-Host ""
Write-Host "Credenciales de prueba:" -ForegroundColor Yellow
Write-Host "   Admin:  admin@quickbite.com / admin123" -ForegroundColor White
Write-Host "   Cocina: kitchen@quickbite.com / kitchen123" -ForegroundColor White
Write-Host "   Cliente: customer@quickbite.com / customer123" -ForegroundColor White
Write-Host ""
Write-Host "Logs disponibles en la carpeta 'logs/'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para detener todos los servicios:" -ForegroundColor Red
Write-Host "   .\stop.ps1" -ForegroundColor White

# Mantener el script corriendo
Write-Host ""
Write-Host "Presione Ctrl+C para detener todos los servicios..." -ForegroundColor Gray

# Trap para limpiar procesos al salir
try {
    while ($true) {
        Start-Sleep -Seconds 5
        $frontendRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue
        $javaRunning = Get-Process -Name "java" -ErrorAction SilentlyContinue
        
        if (-not $frontendRunning -or -not $javaRunning) {
            Write-Host "ADVERTENCIA: Algunos servicios se detuvieron. Verifique los logs." -ForegroundColor Yellow
        }
    }
}
finally {
    Write-Host ""
    Write-Host "Deteniendo todos los servicios..." -ForegroundColor Red
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Stop-Process -Name "java" -Force -ErrorAction SilentlyContinue
    Write-Host "Servicios detenidos" -ForegroundColor Green
}
