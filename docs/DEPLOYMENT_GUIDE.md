# WebGIS AI - Deployment Guide

## Overview

This guide covers deployment strategies for the WebGIS AI platform across different environments and cloud providers.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   AI Workers   │
│   (React/Vite)  │───▶│   (Flask/Django)│───▶│   (GPU Nodes)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      CDN        │    │    Database     │    │   File Storage  │
│   (CloudFlare)  │    │  (PostgreSQL)   │    │      (S3)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements
- **CPU**: 8+ cores for API server
- **RAM**: 32GB+ for AI processing nodes
- **GPU**: NVIDIA RTX 3080+ or Tesla V100+
- **Storage**: 1TB+ SSD for video processing
- **Network**: 1Gbps+ bandwidth

### Software Dependencies
- Docker 20.10+
- Docker Compose 2.0+
- Kubernetes 1.24+ (for production)
- NVIDIA Docker runtime
- Python 3.9+
- Node.js 18+

## Local Development

### Quick Start
```bash
# Clone repository
git clone https://github.com/webgis-ai/platform.git
cd platform

# Start services
docker-compose -f docker-compose.dev.yml up -d

# Frontend development
cd frontend
npm install
npm run dev

# Backend development
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver
```

### Environment Configuration
```env
# .env.development
NODE_ENV=development
VITE_API_URL=http://localhost:8000
VITE_WMS_PROXY_URL=http://localhost:8000/api/wms

DATABASE_URL=postgresql://webgis:password@localhost:5432/webgis_dev
REDIS_URL=redis://localhost:6379
CELERY_BROKER_URL=redis://localhost:6379

# AI Processing
CUDA_VISIBLE_DEVICES=0
RIFE_MODEL_PATH=/models/rife
BATCH_SIZE=8
```

## Staging Environment

### AWS Deployment

#### Infrastructure Setup
```bash
# Create VPC and subnets
aws ec2 create-vpc --cidr-block 10.0.0.0/16
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.1.0/24

# Create security groups
aws ec2 create-security-group --group-name webgis-api --description "WebGIS API"
aws ec2 authorize-security-group-ingress --group-id sg-xxx --protocol tcp --port 80 --cidr 0.0.0.0/0
```

#### EC2 Instance Setup
```bash
# Launch GPU instance for AI processing
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type p3.2xlarge \
  --key-name webgis-key \
  --security-group-ids sg-xxx \
  --subnet-id subnet-xxx \
  --user-data file://scripts/gpu-setup.sh
```

#### RDS Database
```bash
# Create PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier webgis-staging \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 14.9 \
  --allocated-storage 100 \
  --storage-type gp2 \
  --db-name webgis \
  --master-username webgis \
  --master-user-password SecurePassword123
```

#### Docker Compose for Staging
```yaml
# docker-compose.staging.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.staging
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://api-staging.webgis-ai.com

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - redis

  ai-worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.gpu
    runtime: nvidia
    environment:
      - CUDA_VISIBLE_DEVICES=0
      - CELERY_WORKER_TYPE=ai_processing
    volumes:
      - ./models:/models
      - ./temp:/tmp/processing

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/staging.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
```

## Production Deployment

### Kubernetes Setup

#### Namespace and ConfigMap
```yaml
# k8s/namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: webgis-ai

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: webgis-config
  namespace: webgis-ai
data:
  DATABASE_URL: "postgresql://webgis:password@postgres:5432/webgis"
  REDIS_URL: "redis://redis:6379"
  AI_MODEL_PATH: "/models"
```

#### Frontend Deployment
```yaml
# k8s/frontend.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: webgis-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: webgis-ai/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: webgis-ai
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

#### Backend API Deployment
```yaml
# k8s/backend.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
  namespace: webgis-ai
spec:
  replicas: 5
  selector:
    matchLabels:
      app: backend-api
  template:
    metadata:
      labels:
        app: backend-api
    spec:
      containers:
      - name: backend-api
        image: webgis-ai/backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: webgis-config
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
```

#### GPU Worker Deployment
```yaml
# k8s/gpu-workers.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gpu-workers
  namespace: webgis-ai
spec:
  replicas: 2
  selector:
    matchLabels:
      app: gpu-workers
  template:
    metadata:
      labels:
        app: gpu-workers
    spec:
      nodeSelector:
        accelerator: nvidia-tesla-v100
      containers:
      - name: gpu-worker
        image: webgis-ai/gpu-worker:latest
        envFrom:
        - configMapRef:
            name: webgis-config
        resources:
          requests:
            nvidia.com/gpu: 1
            memory: "8Gi"
            cpu: "4000m"
          limits:
            nvidia.com/gpu: 1
            memory: "16Gi"
            cpu: "8000m"
        volumeMounts:
        - name: model-storage
          mountPath: /models
        - name: temp-storage
          mountPath: /tmp/processing
      volumes:
      - name: model-storage
        persistentVolumeClaim:
          claimName: model-pvc
      - name: temp-storage
        emptyDir:
          sizeLimit: 100Gi
```

### Database Setup

#### PostgreSQL with PostGIS
```sql
-- Create database and extensions
CREATE DATABASE webgis_production;
\c webgis_production;

CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;
CREATE EXTENSION hstore;

-- Create users and permissions
CREATE USER webgis_api WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE webgis_production TO webgis_api;
GRANT USAGE ON SCHEMA public TO webgis_api;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO webgis_api;
```

#### Database Migration
```bash
# Production migration
python manage.py migrate --database=production
python manage.py collectstatic --noinput
python manage.py compress --force
```

### Monitoring and Logging

#### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'webgis-api'
    static_configs:
      - targets: ['backend-api:8000']
    metrics_path: /metrics

  - job_name: 'webgis-workers'
    static_configs:
      - targets: ['gpu-workers:9090']
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "WebGIS AI Platform",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "GPU Utilization",
        "type": "graph",
        "targets": [
          {
            "expr": "nvidia_gpu_utilization_gpu"
          }
        ]
      }
    ]
  }
}
```

### Security Configuration

#### SSL/TLS Setup
```bash
# Generate SSL certificate
certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
  -d webgis-ai.com \
  -d api.webgis-ai.com
```

#### Nginx Configuration
```nginx
# nginx/production.conf
upstream backend {
    server backend-api:8000 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name webgis-ai.com;

    ssl_certificate /etc/ssl/certs/webgis-ai.com.pem;
    ssl_certificate_key /etc/ssl/private/webgis-ai.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Frontend
    location / {
        proxy_pass http://frontend-service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for real-time updates
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Backup and Recovery

#### Database Backup
```bash
#!/bin/bash
# scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/database"
DB_NAME="webgis_production"

# Create backup
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/webgis_$DATE.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/webgis_$DATE.sql.gz s3://webgis-backups/database/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete
```

#### Model Backup
```bash
#!/bin/bash
# scripts/backup-models.sh

MODEL_DIR="/models"
BACKUP_DIR="/backups/models"
DATE=$(date +%Y%m%d_%H%M%S)

# Create model backup
tar -czf $BACKUP_DIR/models_$DATE.tar.gz -C $MODEL_DIR .

# Upload to S3
aws s3 cp $BACKUP_DIR/models_$DATE.tar.gz s3://webgis-backups/models/
```

### Performance Optimization

#### CDN Configuration
```javascript
// CloudFlare Workers script
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Cache static assets
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
    const cache = caches.default
    const cacheKey = new Request(url.toString(), request)
    
    let response = await cache.match(cacheKey)
    if (!response) {
      response = await fetch(request)
      event.waitUntil(cache.put(cacheKey, response.clone()))
    }
    
    return response
  }
  
  return fetch(request)
}
```

#### Database Optimization
```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_projects_user_id ON projects(user_id);
CREATE INDEX CONCURRENTLY idx_projects_status ON projects(status);
CREATE INDEX CONCURRENTLY idx_datasets_provider ON datasets(provider);
CREATE INDEX CONCURRENTLY idx_datasets_bounds ON datasets USING GIST(bounds);

-- Partitioning for large tables
CREATE TABLE processing_logs_2024 PARTITION OF processing_logs
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Scaling Strategies

#### Horizontal Pod Autoscaler
```yaml
# k8s/hpa.yml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-api-hpa
  namespace: webgis-ai
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-api
  minReplicas: 5
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Load Testing
```bash
# Load testing with k6
npm install -g k6

# API load test
k6 run --vus 100 --duration 10m scripts/load-test-api.js

# GPU processing load test
k6 run --vus 10 --duration 30m scripts/load-test-processing.js
```

### Disaster Recovery

#### Multi-Region Setup
```yaml
# terraform/multi-region.tf
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

provider "aws" {
  alias  = "eu-west-1"
  region = "eu-west-1"
}

# Primary region resources
module "primary_region" {
  source    = "./modules/webgis-cluster"
  providers = {
    aws = aws.us-east-1
  }
  region = "us-east-1"
}

# Secondary region resources
module "secondary_region" {
  source    = "./modules/webgis-cluster"
  providers = {
    aws = aws.eu-west-1
  }
  region = "eu-west-1"
}
```

### Maintenance Windows

#### Rolling Updates
```bash
#!/bin/bash
# scripts/rolling-update.sh

# Update backend API
kubectl set image deployment/backend-api backend-api=webgis-ai/backend:v2.1.0 -n webgis-ai
kubectl rollout status deployment/backend-api -n webgis-ai

# Update frontend
kubectl set image deployment/frontend frontend=webgis-ai/frontend:v2.1.0 -n webgis-ai
kubectl rollout status deployment/frontend -n webgis-ai

# Update GPU workers
kubectl set image deployment/gpu-workers gpu-worker=webgis-ai/gpu-worker:v2.1.0 -n webgis-ai
kubectl rollout status deployment/gpu-workers -n webgis-ai
```

## Troubleshooting

### Common Issues

#### GPU Memory Issues
```bash
# Check GPU memory usage
nvidia-smi

# Clear GPU cache
python -c "import torch; torch.cuda.empty_cache()"

# Restart GPU workers
kubectl delete pods -l app=gpu-workers -n webgis-ai
```

#### Database Connection Issues
```bash
# Check database connectivity
kubectl exec -it backend-api-xxx -n webgis-ai -- python manage.py dbshell

# Check connection pool
kubectl exec -it backend-api-xxx -n webgis-ai -- python -c "
from django.db import connection
print(connection.queries)
"
```

### Monitoring Commands
```bash
# Check cluster status
kubectl get nodes
kubectl get pods -n webgis-ai
kubectl top nodes
kubectl top pods -n webgis-ai

# Check logs
kubectl logs -f deployment/backend-api -n webgis-ai
kubectl logs -f deployment/gpu-workers -n webgis-ai

# Check resource usage
kubectl describe node gpu-node-1
```

This deployment guide provides a comprehensive approach to deploying the WebGIS AI platform across different environments with proper scaling, monitoring, and maintenance procedures.