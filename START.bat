@echo off
echo Iniciando QuickBite - Modo Evaluacion Local
echo ==========================================

echo Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    pause
    exit /b 1
)

echo Verificando Java...
java -version
if %errorlevel% neq 0 (
    echo ERROR: Java no esta instalado
    pause
    exit /b 1
)

echo Verificando Maven...
mvn --version
if %errorlevel% neq 0 (
    echo ERROR: Maven no esta instalado
    pause
    exit /b 1
)

echo.
echo Instalando dependencias del frontend...
cd frontend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Error al instalar dependencias del frontend
    pause
    exit /b 1
)
cd ..

echo.
echo Compilando microservicios...
echo Compilando Eureka Server...
cd backend\eureka-server
mvn clean compile
cd ..\..

echo Compilando API Gateway...
cd backend\api-gateway
mvn clean compile
cd ..\..

echo Compilando Auth Service...
cd Backend\quickbite-Auth-main
mvn clean compile
cd ..\..

echo Compilando Inventory Service...
cd Backend\quickbite-ms-inventario
mvn clean compile
cd ..\..

echo Compilando Menu Service...
cd Backend\quickbite-menu-service
mvn clean compile
cd ..\..

echo Compilando Order Service...
cd Backend\quickbite-pedidos-main
mvn clean compile
cd ..\..

echo Compilando Payment Service...
cd Backend\quickbite-payment-service
mvn clean compile
cd ..\..

echo Compilando Kitchen Service...
cd Backend\quickbite-kitchen-service
mvn clean compile
cd ..\..

echo Compilando Notification Service...
cd Backend\quickbite-ms-notificaciones
mvn clean compile
cd ..\..

echo.
echo Iniciando servicios...
echo Iniciando Eureka Server (puerto 8761)...
start "Eureka Server" cmd /k "cd backend\eureka-server && mvn spring-boot:run -Dspring-boot.run.jvmArguments=-Dserver.port=8761"
timeout /t 10 /nobreak > nul

echo Iniciando API Gateway (puerto 8080)...
start "API Gateway" cmd /k "cd backend\api-gateway && mvn spring-boot:run -Dspring-boot.run.jvmArguments=-Dserver.port=8080"
timeout /t 15 /nobreak > nul

echo Iniciando Auth Service (puerto 8081)...
start "Auth Service" cmd /k "cd Backend\quickbite-Auth-main && mvn spring-boot:run -Dspring-boot.run.jvmArguments=-Dserver.port=8081"
timeout /t 5 /nobreak > nul

echo Iniciando Inventory Service (puerto 8082)...
start "Inventory Service" cmd /k "cd Backend\quickbite-ms-inventario && mvn spring-boot:run -Dspring-boot.run.jvmArguments=-Dserver.port=8082"
timeout /t 5 /nobreak > nul

echo Iniciando Menu Service (puerto 8083)...
start "Menu Service" cmd /k "cd Backend\quickbite-menu-service && mvn spring-boot:run -Dspring-boot.run.jvmArguments=-Dserver.port=8083"
timeout /t 5 /nobreak > nul

echo Iniciando Order Service (puerto 8084)...
start "Order Service" cmd /k "cd Backend\quickbite-pedidos-main && mvn spring-boot:run -Dspring-boot.run.jvmArguments=-Dserver.port=8084"
timeout /t 5 /nobreak > nul

echo Iniciando Payment Service (puerto 8085)...
start "Payment Service" cmd /k "cd Backend\quickbite-payment-service && mvn spring-boot:run -Dspring-boot.run.jvmArguments=-Dserver.port=8085"
timeout /t 5 /nobreak > nul

echo Iniciando Kitchen Service (puerto 8086)...
start "Kitchen Service" cmd /k "cd Backend\quickbite-kitchen-service && mvn spring-boot:run -Dspring-boot.run.jvmArguments=-Dserver.port=8086"
timeout /t 5 /nobreak > nul

echo Iniciando Notification Service (puerto 8087)...
start "Notification Service" cmd /k "cd Backend\quickbite-ms-notificaciones && mvn spring-boot:run -Dspring-boot.run.jvmArguments=-Dserver.port=8087"
timeout /t 5 /nobreak > nul

echo Iniciando Frontend (puerto 3000)...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo Esperando que todos los servicios inicien...
timeout /t 30 /nobreak > nul

echo.
echo QuickBite esta iniciando...
echo.
echo URLs de acceso:
echo    Frontend:           http://localhost:3000
echo    API Gateway:        http://localhost:8080
echo    Eureka Dashboard:   http://localhost:8761
echo.
echo Credenciales de prueba:
echo    Admin:  admin@quickbite.com / admin123
echo    Cocina: kitchen@quickbite.com / kitchen123
echo    Cliente: customer@quickbite.com / customer123
echo.
echo Se abriran 10 ventanas de consola con los servicios.
echo Cierra las ventanas para detener los servicios.
echo.
pause
