FROM openjdk:17-jdk-slim

WORKDIR /app

# Copiar el archivo JAR
COPY target/eureka-server-1.0.0.jar app.jar

# Exponer el puerto
EXPOSE 8761

# Iniciar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
