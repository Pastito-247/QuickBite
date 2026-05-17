# Etapa 1: Construcción (Build)
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copiar primero el pom.xml para aprovechar el cache de Maven
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el código fuente y compilar
COPY src ./src
RUN mvn clean package -DskipTests -B

# Etapa 2: Ejecución (Run) - Imagen optimizada
FROM eclipse-temurin:17-jre-alpine

# Crear usuario no root para seguridad
RUN addgroup -g 1001 quickbite && \
    adduser -D -s /bin/sh -u 1001 -G quickbite quickbite

# Instalar tzdata para manejo de zonas horarias
RUN apk add --no-cache tzdata

# Crear directorio de logs
RUN mkdir -p /app/logs && \
    chown -R quickbite:quickbite /app

WORKDIR /app

# Copiar el archivo .jar generado en la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Cambiar al usuario no root
USER quickbite

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8081/actuator/health || exit 1

EXPOSE 8081

# Variables de entorno por defecto
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:+UseContainerSupport"
ENV SPRING_PROFILES_ACTIVE=prod

# Comando para ejecutar la aplicación
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]