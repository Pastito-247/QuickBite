#!/bin/bash

# QuickBite Local Development Script
# Este script configura el entorno de desarrollo local

echo "🛠️ Configurando entorno de desarrollo local para QuickBite..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instale Node.js 18+ primero."
    exit 1
fi

# Verificar Java
if ! command -v java &> /dev/null; then
    echo "❌ Java no está instalado. Por favor, instale Java 17+ primero."
    exit 1
fi

# Verificar Maven
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven no está instalado. Por favor, instale Maven primero."
    exit 1
fi

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install
cd ..

# Compilar microservicios
echo "🔨 Compilando microservicios..."
cd Backend

echo "Compilando Auth Service..."
cd quickbite-Auth-main
mvn clean compile
cd ..

echo "Compilando Inventory Service..."
cd quickbite-ms-inventario
mvn clean compile
cd ..

echo "Compilando Menu Service..."
cd quickbite-menu-service
mvn clean compile
cd ..

echo "Compilando Order Service..."
cd quickbite-pedidos-main
mvn clean compile
cd ..

echo "Compilando Payment Service..."
cd quickbite-payment-service
mvn clean compile
cd ..

echo "Compilando Kitchen Service..."
cd quickbite-kitchen-service
mvn clean compile
cd ..

echo "Compilando Notification Service..."
cd quickbite-ms-notificaciones
mvn clean compile
cd ..

cd ..

# Compilar API Gateway y Eureka Server
echo "Compilando API Gateway..."
cd backend/api-gateway
mvn clean compile
cd ../eureka-server
mvn clean compile
cd ../..

echo ""
echo "✅ Entorno de desarrollo local configurado!"
echo ""
echo "🚀 Para iniciar el desarrollo:"
echo "   1. Iniciar las bases de datos: docker-compose up -d auth-db inventory-db menu-db order-db payment-db kitchen-db notification-db"
echo "   2. Iniciar Eureka Server: cd backend/eureka-server && mvn spring-boot:run"
echo "   3. Iniciar API Gateway: cd backend/api-gateway && mvn spring-boot:run"
echo "   4. Iniciar microservicios en terminales separados:"
echo "      - Backend/quickbite-Auth-main && mvn spring-boot:run"
echo "      - Backend/quickbite-ms-inventario && mvn spring-boot:run"
echo "      - Backend/quickbite-menu-service && mvn spring-boot:run"
echo "      - Backend/quickbite-pedidos-main && mvn spring-boot:run"
echo "      - Backend/quickbite-payment-service && mvn spring-boot:run"
echo "      - Backend/quickbite-kitchen-service && mvn spring-boot:run"
echo "      - Backend/quickbite-ms-notificaciones && mvn spring-boot:run"
echo "   5. Iniciar frontend: cd frontend && npm start"
echo ""
echo "🌐 URLs de acceso:"
echo "   Frontend:           http://localhost:3000"
echo "   API Gateway:        http://localhost:8080"
echo "   Eureka Dashboard:   http://localhost:8761"
