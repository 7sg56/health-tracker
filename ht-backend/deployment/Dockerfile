# Health Tracker Backend - Production Dockerfile

# Build stage
FROM maven:3.9-openjdk-21-slim AS build

WORKDIR /app

# Copy pom.xml and download dependencies (for better layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build application
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM openjdk:21-jdk-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create application user for security
RUN groupadd -r healthtracker && useradd -r -g healthtracker healthtracker

# Create directories
RUN mkdir -p /app /var/log/healthtracker /opt/ssl && \
    chown -R healthtracker:healthtracker /app /var/log/healthtracker /opt/ssl

# Set working directory
WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/ht-backend-*.jar app.jar

# Change ownership
RUN chown healthtracker:healthtracker app.jar

# Switch to non-root user
USER healthtracker

# Expose ports
EXPOSE 8080 8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8081/actuator/health || exit 1

# JVM options for production
ENV JAVA_OPTS="-Xms512m -Xmx1g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/healthtracker/"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]