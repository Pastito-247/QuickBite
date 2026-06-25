#!/bin/bash
# Obtener la IP pública desde un servicio externo confiable
NEW_IP=$(curl -s https://ifconfig.me)

echo "Actualizando frontend a la IP: $NEW_IP"

# Inyectar la configuración al contenedor del frontend
docker exec -i quickbite-frontend sh -c "echo \"window.__REACT_APP_API_URL='http://$NEW_IP:8080';\" > /usr/share/nginx/html/env-config.js"

# Reiniciar el contenedor para que Nginx cargue la nueva configuración
docker restart quickbite-frontend

echo "¡Listo! El frontend ya apunta a http://$NEW_IP:8080"
