FROM openjdk:17-jre-slim

LABEL maintainer="QuickBite Team"
LABEL version="1.0"
LABEL description="QuickBite Inventory Microservice"

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy jar file
COPY target/inv-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8082

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8082/api/inventory/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=docker", "app.jar"]
