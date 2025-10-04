# Health Tracker Backend - Deployment

This directory contains all the necessary files and configurations for deploying the Health Tracker Backend application in production environments.

## Quick Start

### 1. Environment Setup

Copy the environment template and configure your settings:

```bash
cp environment-template.env .env
# Edit .env with your production values
```

### 2. Build Application

```bash
cd ..
./mvnw clean package -Pprod
```

### 3. Deploy with Docker Compose (Recommended)

```bash
cd deployment
docker-compose up -d
```

### 4. Deploy with Startup Script

```bash
cd deployment
source .env
./start-production.sh start
```

## Files Overview

### Configuration Files

- **`application-dev.properties`** - Development profile configuration
- **`application-prod.properties`** - Production profile configuration  
- **`logback-spring.xml`** - Logging configuration with profile-specific settings
- **`environment-template.env`** - Environment variables template

### Deployment Files

- **`docker-compose.yml`** - Complete Docker Compose setup with MySQL, Nginx, and monitoring
- **`Dockerfile`** - Production-ready Docker image
- **`start-production.sh`** - Production startup script for non-Docker deployments

### Configuration Templates

- **`nginx/nginx.conf`** - Nginx reverse proxy configuration
- **`prometheus/prometheus.yml`** - Prometheus monitoring configuration

### Documentation

- **`production-deployment-guide.md`** - Comprehensive production deployment guide
- **`README.md`** - This file

## Deployment Options

### Option 1: Docker Compose (Recommended)

Complete containerized deployment with all dependencies:

```bash
# Basic deployment
docker-compose up -d

# With Nginx reverse proxy
docker-compose --profile with-nginx up -d

# With monitoring (Prometheus + Grafana)
docker-compose --profile with-monitoring up -d

# Full deployment with all services
docker-compose --profile with-nginx --profile with-monitoring up -d
```

### Option 2: Standalone JAR

Direct JAR deployment on the host system:

```bash
# Using the startup script
./start-production.sh start

# Manual deployment
java -Dspring.profiles.active=prod -jar ../target/ht-backend-*.jar
```

### Option 3: Systemd Service

For production Linux servers:

```bash
# Copy service file (see production-deployment-guide.md)
sudo cp healthtracker.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable healthtracker
sudo systemctl start healthtracker
```

## Environment Configuration

### Required Variables

```bash
DB_URL=jdbc:mysql://localhost:3306/health_tracker_prod
DB_USERNAME=healthtracker_user
DB_PASSWORD=your_secure_password
```

### Optional Variables

```bash
COOKIE_DOMAIN=yourdomain.com
SSL_ENABLED=true
SSL_KEYSTORE=/path/to/keystore.p12
SSL_KEYSTORE_PASSWORD=keystore_password
LOG_FILE_PATH=/var/log/healthtracker/application.log
MANAGEMENT_PORT=8081
```

## Monitoring and Health Checks

### Health Endpoints

- **Application Health**: `http://localhost:8081/actuator/health`
- **Application Info**: `http://localhost:8081/actuator/info`
- **Metrics**: `http://localhost:8081/actuator/metrics`
- **Custom Endpoint**: `http://localhost:8081/actuator/healthtracker`

### Prometheus Metrics

Available at `http://localhost:8081/actuator/prometheus` for integration with monitoring systems.

### Log Files

- **Application Logs**: `/var/log/healthtracker/application.log`
- **Error Logs**: `/var/log/healthtracker/application-error.log`

## Security Considerations

### Production Checklist

- [ ] Use strong database passwords
- [ ] Enable SSL/HTTPS in production
- [ ] Configure secure session cookies
- [ ] Restrict management endpoints to internal networks
- [ ] Set up proper firewall rules
- [ ] Enable log monitoring and alerting
- [ ] Regular security updates
- [ ] Backup strategy in place

### SSL Configuration

1. Obtain SSL certificate
2. Convert to PKCS12 format:
   ```bash
   openssl pkcs12 -export -in certificate.crt -inkey private.key -out keystore.p12
   ```
3. Set environment variables:
   ```bash
   SSL_ENABLED=true
   SSL_KEYSTORE=/path/to/keystore.p12
   SSL_KEYSTORE_PASSWORD=your_password
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials
   - Verify database server is running
   - Check network connectivity

2. **Application Won't Start**
   - Check Java version (21+ required)
   - Verify environment variables
   - Check log files for errors

3. **Health Check Fails**
   - Verify application is running
   - Check management port (8081)
   - Review application logs

### Log Analysis

Monitor these patterns:
- `ERROR` - Application errors
- `WARN` - Potential issues
- Authentication failures
- Database connection issues
- High response times

### Getting Help

1. Check application logs: `tail -f /var/log/healthtracker/application.log`
2. Check health endpoint: `curl http://localhost:8081/actuator/health`
3. Review startup logs: `tail -f /var/log/healthtracker/startup.log`
4. Check system resources: `htop`, `df -h`, `free -m`

## Performance Tuning

### JVM Options

```bash
JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

### Database Optimization

- Connection pooling configured in `application-prod.properties`
- Index optimization for frequently queried columns
- Regular database maintenance

### Monitoring

Set up alerts for:
- High CPU/memory usage
- Database connection pool exhaustion
- High error rates
- Slow response times

## Backup and Recovery

### Database Backup

```bash
# Daily backup
mysqldump --single-transaction health_tracker_prod > backup_$(date +%Y%m%d).sql

# Automated backup script
0 2 * * * /usr/local/bin/backup-healthtracker.sh
```

### Application Backup

- Configuration files
- SSL certificates
- Log files (if needed for compliance)

## Scaling Considerations

### Horizontal Scaling

- Load balancer configuration
- Session store externalization (Redis)
- Database read replicas
- CDN for static content

### Vertical Scaling

- Increase JVM heap size
- Database connection pool tuning
- CPU and memory optimization

## Support

For deployment issues or questions:

1. Review this documentation
2. Check the production deployment guide
3. Review application logs
4. Check health endpoints
5. Consult the troubleshooting section