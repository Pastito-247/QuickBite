# Comandos GitFlow para Quick Bite

## 🚀 Configuración Inicial

### 1. Ejecutar el script de configuración
```bash
# En Windows
.\scripts\setup-gitflow.bat

# O manualmente:
git checkout -b main
git checkout -b develop
git add .
git commit -m "build: configurar estructura GitFlow para Quick Bite"
```

### 2. Crear base de datos
```bash
# Ejecutar script de bases de datos
.\scripts\setup-databases.bat
```

## 🌟 Flujo de Trabajo - Authentication Service

### Paso 1: Crear feature branch
```bash
git checkout develop
git checkout -b feature/authentication-service
```

### Paso 2: Trabajo en el feature
```bash
# Hacer cambios...
git add .
git commit -m "feat: implementar servicio de autenticación con JWT"
git commit -m "feat: agregar configuración de Spring Security"
git commit -m "feat: crear endpoints de registro y login"
```

### Paso 3: Fusionar a develop
```bash
git checkout develop
git merge feature/authentication-service --no-ff
git push origin develop
git branch -d feature/authentication-service
```

## 🔄 Próximos Microservicios

### Menu Service
```bash
git checkout develop
git checkout -b feature/menu-service
# Trabajar en menu service...
git checkout develop
git merge feature/menu-service --no-ff
git push origin develop
```

### Order Service
```bash
git checkout develop
git checkout -b feature/order-service
# Trabajar en order service...
git checkout develop
git merge feature/order-service --no-ff
git push origin develop
```

### Kitchen Service
```bash
git checkout develop
git checkout -b feature/kitchen-service
# Trabajar en kitchen service...
git checkout develop
git merge feature/kitchen-service --no-ff
git push origin develop
```

## 🚀 Release (Cuando esté listo para producción)

```bash
git checkout develop
git checkout -b release/v1.0.0

# Preparar release...
git commit -m "build: preparar versión v1.0.0"

# Fusionar a main
git checkout main
git merge release/v1.0.0 --no-ff
git tag v1.0.0

# Fusionar de vuelta a develop
git checkout develop
git merge release/v1.0.0 --no-ff

# Push y cleanup
git push origin main
git push origin develop
git push origin --tags
git branch -d release/v1.0.0
```

## 📋 Estructura de Ramas Esperada

```
main (producción)
├── v1.0.0 (tag)
└── v1.0.1 (tag)

develop (desarrollo)
├── feature/authentication-service (completado)
├── feature/menu-service (en progreso)
├── feature/order-service (pendiente)
└── feature/kitchen-service (pendiente)

feature/* (ramas temporales)
├── feature/authentication-service
├── feature/menu-service
├── feature/order-service
└── feature/kitchen-service
```

## 🎯 Convenciones de Commits

- `feat:` Nueva característica
- `fix:` Corrección de error
- `docs:` Documentación
- `style:` Formato/código sin lógica
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Tareas de mantenimiento
- `build:` Cambios en build/dependencias

## 📊 Progreso Visible en GitHub

Con este flujo, en GitHub se verá:

1. **Rama main**: Código estable de producción
2. **Rama develop**: Últimos desarrollos integrados
3. **Pull Requests**: Por cada feature branch
4. **Tags**: Versiones de lanzamiento
5. **Commits claros**: Con convenciones consistentes

Esto mostrará claramente el avance del proyecto Quick Bite!
