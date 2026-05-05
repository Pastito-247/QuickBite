@echo off
REM Script para configurar GitFlow para el proyecto Quick Bite
REM Este script crea la estructura de ramas necesaria para GitFlow

echo 🚀 Configurando GitFlow para Quick Bite Authentication Service...

REM Verificar si estamos en un repositorio git
if not exist ".git" (
    echo ❌ Error: No estás en un repositorio Git. Ejecuta 'git init' primero.
    pause
    exit /b 1
)

REM Configurar ramas principales
echo 📋 Creando rama main...
git checkout -b main 2>nul || git checkout main

REM Crear rama develop desde main
echo 📋 Creando rama develop...
git checkout -b develop

REM Crear documentación de GitFlow
echo 📝 Creando documentación de GitFlow...
(
echo # Flujo de Trabajo GitFlow - Quick Bite
echo.
echo ## 🌳 Estructura de Ramas
echo.
echo ### Ramas Principales
echo - **main**: Rama de producción con código estable y probado
echo - **develop**: Rama de desarrollo con últimas características
echo.
echo ### Ramas de Soporte
echo - **feature/***: Nuevas características para el proyecto
echo - **release/***: Preparación para lanzamiento de versión
echo - **hotfix/***: Correcciones urgentes para producción
echo.
echo ## 🔄 Flujo de Trabajo
echo.
echo ### 1. Nueva Característica
echo ```bash
echo # Desde develop
echo git checkout develop
echo git pull origin develop
echo git checkout -b feature/nueva-caracteristica
echo.
echo # Desarrollo...
echo git add .
echo git commit -m "feat: agregar nueva característica"
echo.
echo # Fusionar a develop
echo git checkout develop
echo git merge feature/nueva-caracteristica
echo git push origin develop
echo git branch -d feature/nueva-caracteristica
echo ```
echo.
echo ### 2. Lanzamiento ^(Release^)
echo ```bash
echo # Desde develop
echo git checkout -b release/v1.0.0
echo.
echo # Preparar lanzamiento...
echo git commit -m "build: preparar versión v1.0.0"
echo.
echo # Fusionar a main y develop
echo git checkout main
echo git merge release/v1.0.0
echo git tag v1.0.0
echo.
echo git checkout develop
echo git merge release/v1.0.0
echo ```
echo.
echo ### 3. Corrección Urgente ^(Hotfix^)
echo ```bash
echo # Desde main
echo git checkout main
echo git checkout -b hotfix/correccion-urgente
echo.
echo # Corregir problema...
echo git commit -m "fix: corregir problema crítico"
echo.
echo # Fusionar a main y develop
echo git checkout main
echo git merge hotfix/correccion-urgente
echo git tag v1.0.1
echo.
echo git checkout develop
echo git merge hotfix/correccion-urgente
echo ```
echo.
echo ## 📋 Convenciones de Commits
echo.
echo - **feat**: Nueva característica
echo - **fix**: Corrección de error
echo - **docs**: Documentación
echo - **style**: Formato/código sin lógica
echo - **refactor**: Refactorización
echo - **test**: Tests
echo - **chore**: Tareas de mantenimiento
echo - **build**: Cambios en build/dependencias
echo.
echo ## 🚀 Estados Actuales del Proyecto
echo.
echo ### Microservicios Implementados
echo - ✅ **Authentication Service** ^(feature/authentication-service^)
echo - 🔄 **Menu Service** ^(feature/menu-service^) - En desarrollo
echo - 🔄 **Order Service** ^(feature/order-service^) - En desarrollo
echo - 🔄 **Kitchen Service** ^(feature/kitchen-service^) - En desarrollo
echo.
echo ### Bases de Datos
echo - ✅ **quickbite_auth** - Autenticación y usuarios
echo - 🔄 **quickbite_menu** - Catálogo y menú
echo - 🔄 **quickbite_orders** - Pedidos y transacciones
echo - 🔄 **quickbite_kitchen** - Coordinación de cocina
) > GITFLOW.md

REM Hacer commit inicial con la estructura
echo 📦 Creando commit inicial...
git add .
git commit -m "build: configurar estructura GitFlow para Quick Bite"

echo ✅ GitFlow configurado exitosamente!
echo.
echo 📋 Próximos pasos:
echo 1. git checkout develop
echo 2. git checkout -b feature/nueva-caracteristica
echo 3. Trabaja en tu característica
echo 4. git checkout develop
echo 5. git merge feature/nueva-caracteristica
echo.
echo 🌐 Ramas creadas:
git branch -a

pause
