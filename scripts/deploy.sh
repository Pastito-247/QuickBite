#!/bin/bash

# QuickBite Deployment Script
# Este script automatiza el despliegue de toda la arquitectura de microservicios

echo "🚀 Iniciando despliegue de QuickBite..."

# Verificar que Docker y Docker Compose estén instalados
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor, instale Docker primero."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor, instale Docker Compose primero."
    exit 1
fi

# Limpiar contenedores anteriores (opcional)
read -p "¿Desea limpiar contenedores anteriores? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Limpiando contenedores anteriores..."
    docker-compose down -v
    docker system prune -f
fi

# Construir las imágenes
echo "🔨 Construyendo imágenes Docker..."
docker-compose build --no-cache

# Iniciar los servicios
echo "🔄 Iniciando servicios..."
docker-compose up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios inicien..."
sleep 30

# Verificar el estado de los servicios
echo "📊 Verificando estado de los servicios..."
docker-compose ps

# Mostrar logs de los servicios principales
echo "📋 Mostrando logs de servicios principales..."
echo "--- API Gateway ---"
docker-compose logs --tail=20 api-gateway

echo "--- Eureka Server ---"
docker-compose logs --tail=10 eureka-server

echo "--- Frontend ---"
docker-compose logs --tail=10 frontend

# Mostrar URLs de acceso
echo ""
echo "✅ Despliegue completado!"
echo ""
echo "🌐 URLs de acceso:"
echo "   Frontend:           http://localhost:3000"
echo "   API Gateway:        http://localhost:8080"
echo "   Eureka Dashboard:   http://localhost:8761"
echo ""
echo "🔑 Credenciales de prueba:"
echo "   Admin:  admin@quickbite.com / admin123"
echo "   Cocina: kitchen@quickbite.com / kitchen123"
echo "   Cliente: customer@quickbite.com / customer123"
echo ""
echo "📝 Para ver logs en tiempo real:"
echo "   docker-compose logs -f [nombre-servicio]"
echo ""
echo "🛑 Para detener todos los servicios:"
echo "   docker-compose down"
