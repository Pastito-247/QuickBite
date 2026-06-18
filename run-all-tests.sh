#!/bin/bash

# Script para ejecutar todas las pruebas unitarias del proyecto QuickBite
# Autor: QuickBite Team
# Fecha: 17 de junio de 2026

echo "=========================================="
echo "Ejecutando todas las pruebas QuickBite"
echo "=========================================="
echo ""

# Colores para output
GREEN='\033[0;32'
RED='\033[0;31'
YELLOW='\033[1;33'
NC='\033[0m' # No Color

# Contadores
TOTAL_SERVICES=0
PASSED_SERVICES=0
FAILED_SERVICES=0

# Función para ejecutar pruebas de un servicio
run_service_tests() {
    SERVICE_NAME=$1
    SERVICE_PATH=$2
    TEST_COMMAND=$3
    
    echo "------------------------------------------"
    echo "Ejecutando pruebas: $SERVICE_NAME"
    echo "------------------------------------------"
    
    cd "$SERVICE_PATH" || {
        echo -e "${RED}ERROR: No se puede acceder al directorio $SERVICE_PATH${NC}"
        ((FAILED_SERVICES++))
        ((TOTAL_SERVICES++))
        return 1
    }
    
    if eval "$TEST_COMMAND"; then
        echo -e "${GREEN}✓ Pruebas de $SERVICE_NAME PASARON${NC}"
        ((PASSED_SERVICES++))
    else
        echo -e "${RED}✗ Pruebas de $SERVICE_NAME FALLARON${NC}"
        ((FAILED_SERVICES++))
    fi
    
    ((TOTAL_SERVICES++))
    echo ""
}

# Ejecutar pruebas de servicios backend
echo "=== SERVICIOS BACKEND ==="
echo ""

run_service_tests "Auth Service" "Backend/quickbite-Auth-main" "mvn test"
run_service_tests "Inventory Service" "Backend/quickbite-ms-inventario" "mvn test"
run_service_tests "Menu Service" "Backend/quickbite-menu-service" "mvn test"
run_service_tests "Orders Service" "Backend/quickbite-pedidos-main" "mvn test"
run_service_tests "Kitchen Service" "Backend/quickbite-kitchen-service" "mvn test"
run_service_tests "Notifications Service" "Backend/quickbite-ms-notificaciones" "mvn test"
run_service_tests "Payment Service" "Backend/quickbite-payment-service" "mvn test"
run_service_tests "Eureka Server" "Backend/eureka-server" "mvn test"
run_service_tests "API Gateway" "Backend/api-gateway" "mvn test"

# Ejecutar pruebas de frontend
echo "=== FRONTEND ==="
echo ""

run_service_tests "Frontend React" "frontend" "npm test -- --watchAll=false --coverage"

# Volver al directorio raíz
cd ..

# Resumen
echo "=========================================="
echo "RESUMEN DE PRUEBAS"
echo "=========================================="
echo -e "Total de servicios: $TOTAL_SERVICES"
echo -e "${GREEN}Servicios pasados: $PASSED_SERVICES${NC}"
echo -e "${RED}Servicios fallidos: $FAILED_SERVICES${NC}"
echo ""

if [ $FAILED_SERVICES -eq 0 ]; then
    echo -e "${GREEN}¡TODAS LAS PRUEBAS PASARON!${NC}"
    exit 0
else
    echo -e "${RED}ALGUNAS PRUEBAS FALLARON${NC}"
    exit 1
fi
