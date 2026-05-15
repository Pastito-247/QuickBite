@echo off
title QuickBite - MySQL Final
echo =================================
echo Iniciando QuickBite con MySQL
echo =================================
echo.

:: Verificacion basica
echo [1/6] Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no encontrado
    pause
    exit
)
echo OK: Node.js encontrado

echo.
echo [2/6] Verificando Java...
where java >nul 2>&1
if errorlevel 1 (
    echo ERROR: Java no encontrado
    pause
    exit
)
echo OK: Java encontrado

echo.
echo [3/6] Verificando Maven...
where mvn >nul 2>&1
if errorlevel 1 (
    echo ERROR: Maven no encontrado
    pause
    exit
)
echo OK: Maven encontrado

echo.
echo [4/6] Verificando MySQL...
where mysql >nul 2>&1
if errorlevel 1 (
    echo ERROR: MySQL no encontrado
    pause
    exit
)
echo OK: MySQL encontrado

echo.
echo [5/6] Configurando bases de datos...
if exist database-setup.sql (
    echo Ejecutando script de base de datos...
    mysql -u root < database-setup.sql 2>nul
    if errorlevel 1 (
        echo ERROR: No se pudo conectar sin contraseña
        echo Intentando con contraseña...
        mysql -u root -p < database-setup.sql
        if errorlevel 1 (
            echo Las bases de datos ya existen. Continuando...
        ) else (
            echo OK: Bases de datos configuradas
        )
    ) else (
        echo OK: Bases de datos configuradas
    )
) else (
    echo ADVERTENCIA: database-setup.sql no encontrado
    echo Saltando configuracion de base de datos...
)

echo.
echo [6/6] Iniciando servicios...

:: Usar rutas relativas simples
echo Iniciando Eureka Server...
start "Eureka Server" cmd /k "cd backend\eureka-server && mvn spring-boot:run"

echo Esperando 10 segundos...
timeout /t 10 /nobreak >nul

echo Iniciando API Gateway...
start "API Gateway" cmd /k "cd backend\api-gateway && mvn spring-boot:run"

echo Esperando 15 segundos...
timeout /t 15 /nobreak >nul

echo Iniciando Auth Service...
start "Auth Service" cmd /k "cd Backend\quickbite-Auth-main && mvn spring-boot:run"

echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul

echo Iniciando Inventory Service...
start "Inventory Service" cmd /k "cd Backend\quickbite-ms-inventario && mvn spring-boot:run"

echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul

echo Iniciando Menu Service...
start "Menu Service" cmd /k "cd Backend\quickbite-menu-service && mvn spring-boot:run"

echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul

echo Iniciando Order Service...
start "Order Service" cmd /k "cd Backend\quickbite-pedidos-main && mvn spring-boot:run"

echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul

echo Iniciando Payment Service...
start "Payment Service" cmd /k "cd Backend\quickbite-payment-service && mvn spring-boot:run"

echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul

echo Iniciando Kitchen Service...
start "Kitchen Service" cmd /k "cd Backend\quickbite-kitchen-service && mvn spring-boot:run"

echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul

echo Iniciando Notification Service...
start "Notification Service" cmd /k "cd Backend\quickbite-ms-notificaciones && mvn spring-boot:run"

echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul

echo Instalando dependencias del frontend...
cd frontend
call npm install --silent
cd ..

echo Iniciando Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo =================================
echo QuickBite esta iniciando con MySQL
echo =================================
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
echo Se han abierto 9 ventanas de consola con los servicios.
echo Cierra las ventanas para detener los servicios.
echo.
echo Espera 30 segundos para que todos los servicios inicien...
timeout /t 30 /nobreak >nul

echo.
echo QuickBite deberia estar disponible ahora en http://localhost:3000
echo.
pause
