# Health Tracker Backend - Production Deployment Guide

## Overview

This guide provides instructions for deploying the Health Tracker Backend application in a production environment with proper configuration, monitoring, and security settings.

## Prerequisites

- Java 25 or higher
- MySQL 8.0 or higher
- SSL certificate (for HTTPS)
- Reverse proxy (Nginx/Apache) - recommended
- Process manager (systemd/Docker) - recommended

## Environment Variables

Create a `.env` file or set the following environment variables in your production system:

```bash
# Database Configuration
DB_URL=jdbc:mysql://your-db-host:3306/health_tracker_prod
DB_USERNAME=healthtracker_user
DB_PASSWORD=your_secure_password

# Security Configuration
COOKIE_DOMAIN=yourdomain.com
SSL_ENABLED=true
SSL_KEYSTORE=/path/to/your/keystore.p12
SSL_KEYSTORE_PASSWORD=your_keystore_password
SSL_KEYSTORE_TYPE=PKCS12

# Logging Configuration
LOG_FILE_PATH=/var/log/healthtracker/application.log

# Monitoring Configuration
MANAGEMENT_PORT=8081

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
```

## Database Setup

1. Create production database:
```sql
CREATE DATABASE health_tracker_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'healthtracker_user'@'%' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON health_tracker_prod.* TO 'healthtracker_user'@'%';
FLUSH PRIVILEGES;
```

2. Run database migrations (the application will validate schema on startup)

## SSL Certificate Setup

1. Generate or obtain SSL certificate
2. Convert to PKCS12 format if needed:
```bash
openssl pkcs12 -export -in certificate.crt -inkey private.key -out keystore.p12 -name healthtracker
```

## Application Deployment

### Option 1: JAR Deployment

1. Build the application:
```bash
./mvnw clean package -Pprod
```

2. Create systemd service file `/etc/systemd/system/healthtracker.service`:
```ini
[Unit]
Description=Health Tracker Backend
After=network.target

[Service]
Type=simple
User=healthtracker
WorkingDirectory=/opt/healthtracker
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod /opt/healthtracker/ht-backend.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=healthtracker

# Environment variables
Environment=DB_URL=jdbc:mysql://localhost:3306/health_tracker_prod
Environment=DB_USERNAME=healthtracker_user
Environment=DB_PASSWORD=your_secure_password
Environment=COOKIE_DOMAIN=yourdomain.com
Environment=SSL_ENABLED=true
Environment=SSL_KEYSTORE=/opt/healthtracker/ssl/keystore.p12
Environment=SSL_KEYSTORE_PASSWORD=your_keystore_password
Environment=LOG_FILE_PATH=/var/log/healthtracker/application.log
Environment=MANAGEMENT_PORT=8081

[Install]
WantedBy=multi-user.target
```

3. Start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable healthtracker
sudo systemctl start healthtracker
```

### Option 2: Docker Deployment

1. Create Dockerfile:
```dockerfile
FROM openjdk:25-jdk-slim

WORKDIR /app
COPY target/ht-backend-*.jar app.jar

EXPOSE 8080 8081

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

2. Build and run:
```bash
docker build -t healthtracker-backend .
docker run -d \
  --name healthtracker \
  -p 8080:8080 \
  -p 8081:8081 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_URL=jdbc:mysql://host.docker.internal:3306/health_tracker_prod \
  -e DB_USERNAME=healthtracker_user \
  -e DB_PASSWORD=your_secure_password \
  -v /var/log/healthtracker:/var/log/healthtracker \
  -v /opt/ssl:/opt/ssl \
  healthtracker-backend
```

## Reverse Proxy Configuration (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # API endpoints
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Session cookie support
        proxy_cookie_path / "/; Secure; HttpOnly; SameSite=strict";
    }

    # Health check endpoint (restricted)
    location /actuator/health {
        proxy_pass http://localhost:8081;
        allow 10.0.0.0/8;
        allow 172.16.0.0/12;
        allow 192.168.0.0/16;
        deny all;
    }

    # Monitoring endpoints (restricted to internal networks)
    location /actuator/ {
        proxy_pass http://localhost:8081;
        allow 10.0.0.0/8;
        allow 172.16.0.0/12;
        allow 192.168.0.0/16;
        deny all;
    }
}
```

## Monitoring and Health Checks

### Health Check Endpoints

- Application health: `https://yourdomain.com/actuator/health`
- Detailed info: `https://yourdomain.com/actuator/info`
- Metrics: `https://yourdomain.com/actuator/metrics`
- Custom endpoint: `https://yourdomain.com/actuator/healthtracker`

### Log Monitoring

Logs are written to:
- Application logs: `/var/log/healthtracker/application.log`
- Error logs: `/var/log/healthtracker/application-error.log`

Set up log rotation and monitoring with tools like:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- Fluentd

### Metrics Collection

The application exposes Prometheus metrics at `/actuator/prometheus` for integration with monitoring systems.

## Security Considerations

1. **Database Security**:
   - Use strong passwords
   - Limit database user privileges
   - Enable SSL for database connections
   - Regular security updates

2. **Application Security**:
   - Keep Java and dependencies updated
   - Use HTTPS only in production
   - Secure session cookies
   - Regular security scans

3. **Infrastructure Security**:
   - Firewall configuration
   - VPN access for management
   - Regular OS updates
   - Backup encryption

## Backup Strategy

1. **Database Backups**:
```bash
# Daily backup script
mysqldump --single-transaction --routines --triggers health_tracker_prod > backup_$(date +%Y%m%d).sql
```

2. **Application Logs**:
   - Automated log archival
   - Retention policy (30 days for application logs, 60 days for error logs)

## Performance Tuning

1. **JVM Options**:
```bash
-Xms512m -Xmx2g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=200
-XX:+HeapDumpOnOutOfMemoryError
```

2. **Database Optimization**:
   - Connection pooling (configured in application-prod.properties)
   - Query optimization
   - Index maintenance

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Check database credentials
   - Verify network connectivity
   - Check connection pool settings

2. **SSL Certificate Issues**:
   - Verify certificate validity
   - Check keystore format and password
   - Ensure proper file permissions

3. **Memory Issues**:
   - Monitor heap usage via `/actuator/metrics`
   - Adjust JVM memory settings
   - Check for memory leaks

### Log Analysis

Monitor these log patterns:
- `ERROR` level logs for application errors
- `WARN` level logs for potential issues
- Authentication failures
- Database connection issues
- High response times

## Maintenance

1. **Regular Updates**:
   - Security patches
   - Dependency updates
   - Database maintenance

2. **Monitoring**:
   - Set up alerts for health check failures
   - Monitor response times
   - Track error rates
   - Monitor resource usage

3. **Backup Verification**:
   - Regular backup testing
   - Recovery procedure testing
   - Data integrity checks