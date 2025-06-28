# ScandalScope Deployment Guide

## Overview

This guide covers deployment strategies, configuration, and best practices for deploying ScandalScope to production environments.

## Deployment Platforms

### Vercel (Recommended)

Vercel provides seamless deployment with automatic builds and optimizations.

#### Setup Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and link project
   vercel login
   vercel link
   ```

2. **Environment Configuration**
   ```bash
   # Set environment variables
   vercel env add VITE_OPENAI_API_KEY
   vercel env add VITE_PERSPECTIVE_API_KEY
   vercel env add VITE_APP_ENV production
   ```

3. **Deploy**
   ```bash
   # Deploy to production
   vercel --prod
   ```

#### Vercel Configuration (`vercel.json`)
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "VITE_APP_ENV": "production"
  },
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Netlify

Alternative deployment platform with similar features.

#### Setup Steps

1. **Build Configuration (`netlify.toml`)**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
       X-Content-Type-Options = "nosniff"
   ```

2. **Environment Variables**
   Set in Netlify dashboard under Site Settings > Environment Variables

### Docker Deployment

For containerized deployments.

#### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration (`nginx.conf`)
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;
        
        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        
        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

#### Docker Compose
```yaml
version: '3.8'

services:
  scandalscope:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  # Optional: Add monitoring
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

## Environment Configuration

### Environment Variables

#### Required Variables
```bash
# API Keys
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_PERSPECTIVE_API_KEY=your_perspective_api_key

# Application Settings
VITE_APP_ENV=production
VITE_APP_VERSION=2.0.0
```

#### Optional Variables
```bash
# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_LEADERBOARD=true
VITE_MOCK_API_RESPONSES=false

# Analytics
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_POSTHOG_KEY=your_posthog_key

# API Configuration
VITE_API_TIMEOUT=15000
VITE_API_MAX_RETRIES=3
```

### Environment-Specific Configurations

#### Development
```bash
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
VITE_MOCK_API_RESPONSES=true
```

#### Staging
```bash
VITE_APP_ENV=staging
VITE_DEBUG_MODE=false
VITE_MOCK_API_RESPONSES=false
```

#### Production
```bash
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_MOCK_API_RESPONSES=false
VITE_ENABLE_ANALYTICS=true
```

## Build Optimization

### Vite Configuration (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react'],
          charts: ['recharts'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
});
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze

# Build with detailed stats
npm run build -- --mode=analyze
```

## Performance Optimization

### Lighthouse Optimization

Target scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

#### Performance Optimizations
```typescript
// Code splitting
const LazyComponent = lazy(() => import('./LazyComponent'));

// Image optimization
const optimizedImages = {
  webp: '/images/hero.webp',
  fallback: '/images/hero.jpg'
};

// Preload critical resources
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
```

#### Caching Strategy
```typescript
// Service worker for caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### CDN Configuration

#### Cloudflare Settings
```javascript
// Cloudflare Workers script
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const cache = caches.default;
  const cacheKey = new Request(request.url, request);
  
  // Check cache first
  let response = await cache.match(cacheKey);
  
  if (!response) {
    response = await fetch(request);
    
    // Cache static assets
    if (request.url.includes('/assets/')) {
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'public, max-age=31536000');
      response = new Response(response.body, { headers });
      event.waitUntil(cache.put(cacheKey, response.clone()));
    }
  }
  
  return response;
}
```

## Security Configuration

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.openai.com https://commentanalyzer.googleapis.com;
">
```

### Security Headers
```typescript
// Express.js middleware example
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## Monitoring and Analytics

### Error Tracking
```typescript
// Sentry configuration
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_APP_ENV,
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring
```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Health Checks
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VITE_APP_VERSION,
    uptime: process.uptime(),
  });
});
```

## Backup and Recovery

### Database Backup
```bash
# Backup user data (if using database)
pg_dump scandalscope_prod > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Asset Backup
```bash
# Backup static assets
aws s3 sync ./dist s3://scandalscope-backup/$(date +%Y%m%d)
```

## Rollback Strategy

### Blue-Green Deployment
```bash
# Deploy to staging slot
vercel --target staging

# Test staging deployment
npm run test:e2e -- --baseUrl=https://staging.scandalscope.com

# Promote to production
vercel promote --target production
```

### Quick Rollback
```bash
# Rollback to previous deployment
vercel rollback
```

## Maintenance

### Regular Tasks
- Monitor error rates and performance metrics
- Update dependencies monthly
- Review and rotate API keys quarterly
- Backup data weekly
- Performance audits monthly

### Scaling Considerations
- Monitor API rate limits
- Implement request queuing for high traffic
- Consider CDN for global distribution
- Database optimization for user data

This deployment guide ensures ScandalScope can be reliably deployed and maintained in production environments.