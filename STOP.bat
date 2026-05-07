@echo off
echo Deteniendo QuickBite - Modo Evaluacion Local
echo ============================================

echo Cerrando procesos Node.js...
taskkill /f /im node.exe 2>nul

echo Cerrando procesos Java...
taskkill /f /im java.exe 2>nul

echo Cerrando procesos Maven...
taskkill /f /im mvn.exe 2>nul

echo.
echo Esperando que los procesos se detengan...
timeout /t 5 /nobreak > nul

echo Verificando que los puertos esten liberados...
netstat -ano | findstr ":3000" > nul
if %errorlevel% equ 0 (
    echo ADVERTENCIA: Puerto 3000 todavia esta en uso
) else (
    echo Puerto 3000 esta libre
)

netstat -ano | findstr ":8080" > nul
if %errorlevel% equ 0 (
    echo ADVERTENCIA: Puerto 8080 todavia esta en uso
) else (
    echo Puerto 8080 esta libre
)

netstat -ano | findstr ":8761" > nul
if %errorlevel% equ 0 (
    echo ADVERTENCIA: Puerto 8761 todavia esta en uso
) else (
    echo Puerto 8761 esta libre
)

echo.
echo QuickBite ha sido detenido completamente
echo.
echo Para iniciar nuevamente:
echo    START.bat
echo.
pause
