# HealthTracker Frontend Deployment Guide

This guide covers deployment options for the HealthTracker frontend application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build Process](#build-process)
4. [Deployment Options](#deployment-options)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Node.js 18+ 
- npm 8+
- Docker (for containerized deployment)
- Git

### Backend Requirements
- HealthTracker backend API running and accessible
- Database configured and accessible
- CORS properly configured for frontend domain

## Environment Configuration

### Environment Files

Create environment-specific configuration files:

#### Production (`.env.production`)
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.healthtracker.app
NEXT_PUBLIC_APP_URL=https://healthtracker.app
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
NODE_ENV=production
```

#### Staging (`.env.staging`)
```bash
NEXT_PUBLIC_API_BASE_URL=https://staging-api.healthtracker.app
NEXT_PUBLIC_APP_URL=https://staging.healthtracker.app
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_PWA=false
NODE_ENV=production
```

### Required Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | Yes | `http://localhost:8080` |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | Yes | `http://localhost:3000` |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | No | `false` |
| `NEXT_PUBLIC_ENABLE_PWA` | Enable PWA features | No | `false` |
| `NODE_ENV` | Environment mode | Yes | `development` |

## Build Process

### Local Build

```bash
# Install dependencies
npm ci

# Run type checking
npm run type-check

# Run linting
npm run lint:check

# Run tests
npm run test:ci

# Build for production
npm run build:production
```

### Automated Build Script

Use the provided build script for comprehensive building:

```bash
./scripts/build-production.sh
```

This script will:
- Validate Node.js version
- Install dependencies
- Run type checking and linting
- Execute tests
- Build the application
- Generate build report
- Optionally create deployment package

### Build Optimization

#### Bundle Analysis
```bash
npm run build:analyze
```

#### Standalone Build (for Docker)
```bash
npm run build:standalone
```

## Deployment Options

### 1. Vercel Deployment (Recommended)

#### Prerequisites
- Vercel account
- GitHub repository

#### Steps
1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Vercel Configuration (`vercel.json`)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": "@api-base-url",
    "NEXT_PUBLIC_APP_URL": "@app-url"
  }
}
```

### 2. Docker Deployment

#### Build Docker Image
```bash
docker build -t healthtracker-frontend .
```

#### Run Container
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.healthtracker.app \
  -e NEXT_PUBLIC_APP_URL=https://healthtracker.app \
  healthtracker-frontend
```

#### Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### 3. Traditional Server Deployment

#### Prerequisites
- Linux server with Node.js 18+
- Process manager (PM2 recommended)
- Reverse proxy (Nginx recommended)

#### Steps

1. **Upload built application**
   ```bash
   scp -r .next package.json server:/var/www/healthtracker/
   ```

2. **Install PM2**
   ```bash
   npm install -g pm2
   ```

3. **Create PM2 ecosystem file** (`ecosystem.config.js`)
   ```javascript
   module.exports = {
     apps: [{
       name: 'healthtracker-frontend',
       script: 'node_modules/next/dist/bin/next',
       args: 'start',
       cwd: '/var/www/healthtracker',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000,
         NEXT_PUBLIC_API_BASE_URL: 'https://api.healthtracker.app'
       }
     }]
   }
   ```

4. **Start application**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### 4. Static Export (CDN Deployment)

For static hosting on CDN (CloudFront, Netlify, etc.):

```bash
# Build static export
npm run build
npm run export

# Upload 'out' directory to CDN
```

## Performance Optimization

### Code Splitting
- Automatic route-based splitting
- Dynamic imports for heavy components
- Lazy loading for charts and forms

### Caching Strategy
- Static assets: 1 year cache
- API responses: Configurable cache
- Service worker for offline support

### Image Optimization
- Next.js Image component
- WebP/AVIF format support
- Responsive image sizes

### Bundle Optimization
- Tree shaking enabled
- Unused code elimination
- Optimized package imports

## Monitoring and Maintenance

### Health Checks

#### Application Health
```bash
curl -f http://localhost:3000/api/health
```

#### Docker Health Check
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Performance Monitoring

#### Web Vitals
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

#### Custom Metrics
- API response times
- Component render times
- Bundle load times

### Log Management

#### Application Logs
```bash
# PM2 logs
pm2 logs healthtracker-frontend

# Docker logs
docker logs healthtracker-frontend
```

#### Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Updates and Maintenance

#### Rolling Updates
1. Build new version
2. Test in staging environment
3. Deploy to production with zero downtime
4. Monitor for issues
5. Rollback if necessary

#### Database Migrations
Coordinate with backend team for database schema changes.

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Runtime Errors
1. Check environment variables
2. Verify API connectivity
3. Review application logs
4. Check CORS configuration

#### Performance Issues
1. Analyze bundle size
2. Check network requests
3. Monitor memory usage
4. Review caching headers

### Debug Mode

Enable debug mode for troubleshooting:
```bash
DEBUG=* npm run dev
```

### Support Contacts

- **Development Team**: dev@healthtracker.app
- **DevOps Team**: devops@healthtracker.app
- **Emergency**: +1-555-HEALTH

## Security Considerations

### HTTPS Configuration
- Always use HTTPS in production
- Configure proper SSL certificates
- Enable HSTS headers

### Content Security Policy
- Configure CSP headers
- Whitelist trusted domains
- Monitor CSP violations

### Environment Variables
- Never commit sensitive data
- Use secure secret management
- Rotate credentials regularly

## Backup and Recovery

### Application Backup
- Source code in Git repository
- Environment configuration backup
- Build artifacts backup

### Recovery Procedures
1. Restore from Git repository
2. Rebuild application
3. Restore environment configuration
4. Verify functionality

---

For additional support or questions, please refer to the project documentation or contact the development team.