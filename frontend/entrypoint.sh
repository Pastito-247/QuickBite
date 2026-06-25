#!/bin/sh

# Solo si env-config.js no existe, intentamos generarlo con la lógica dinámica
if [ ! -f /usr/share/nginx/html/env-config.js ]; then
    echo "Generando env-config.js automático..."
    AWS_IP=$(curl -s --max-time 2 https://ifconfig.me)
    
    if [ -n "$AWS_IP" ]; then
        API_URL="http://$AWS_IP:8080"
    else
        API_URL="${API_URL:-http://localhost:8080}"
    fi
    echo "window.__REACT_APP_API_URL = '$API_URL';" > /usr/share/nginx/html/env-config.js
else
    echo "env-config.js ya existe, usando configuración persistente."
fi

# Iniciar Nginx
nginx -g "daemon off;"
