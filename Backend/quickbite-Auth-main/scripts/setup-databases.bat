@echo off
REM Script para crear bases de datos para todos los microservicios Quick Bite

echo 🗄️ Creando bases de datos para Quick Bite Microservices...

REM Conectar a MySQL y crear bases de datos
echo 📋 Creando base de datos de autenticación...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS quickbite_auth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo 📋 Creando base de datos de menú...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS quickbite_menu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo 📋 Creando base de datos de pedidos...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS quickbite_orders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo 📋 Creando base de datos de cocina...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS quickbite_kitchen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo 📋 Creando base de datos de inventario...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS quickbite_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo 📋 Creando base de datos de notificaciones...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS quickbite_notifications CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo ✅ Bases de datos creadas exitosamente!
echo.
echo 📋 Bases de datos creadas:
echo - quickbite_auth ^(Autenticación y Usuarios^)
echo - quickbite_menu ^(Catálogo y Menú^)
echo - quickbite_orders ^(Pedidos y Transacciones^)
echo - quickbite_kitchen ^(Coordinación de Cocina^)
echo - quickbite_inventory ^(Gestión de Inventario^)
echo - quickbite_notifications ^(Sistema de Notificaciones^)
echo.
echo 🚀 Listo para configurar los microservicios!

pause
