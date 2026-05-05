# Etapa de construcción
FROM maven:3.9.4-openjdk-17-slim AS build

WORKDIR /app
COPY pom.xml .
COPY src ./src

# Construir la aplicación
RUN mvn clean package -DskipTests

# Etapa de ejecución
FROM openjdk:17-jre-slim

WORKDIR /app

# Crear usuario no root
RUN addgroup --system spring && adduser --system spring --ingroup spring

# Copiar el JAR construido
COPY --from=build /app/target/notificaciones-service-1.0.0.jar app.jar

# Cambiar permisos
RUN chown spring:spring app.jar

# Exponer puerto
EXPOSE 8084

# Cambiar a usuario no root
USER spring

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8084/actuator/health || exit 1

# Iniciar aplicación
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=docker", "app.jar"]
