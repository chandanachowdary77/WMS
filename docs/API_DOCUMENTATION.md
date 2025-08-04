# WebGIS AI - API Documentation

## Overview

This document provides comprehensive API documentation for the WebGIS AI platform backend services.

## Base URL
```
https://api.webgis-ai.com/v1
```

## Authentication

All API requests require authentication using JWT tokens.

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  },
  "token": "jwt_token",
  "refresh_token": "refresh_token"
}
```

#### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### WMS Services

#### GET /wms/services
Get available WMS services.

**Response:**
```json
{
  "services": [
    {
      "id": "bhuvan-1",
      "name": "BHUVAN Satellite Imagery",
      "url": "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms",
      "layers": ["bhuvan:composite_india"],
      "provider": "BHUVAN",
      "bounds": [68.7, 8.4, 97.25, 37.6]
    }
  ]
}
```

#### POST /wms/capabilities
Get WMS capabilities for a service.

**Request Body:**
```json
{
  "service_url": "https://example.com/wms",
  "version": "1.3.0"
}
```

### Datasets

#### GET /datasets
Get available satellite datasets.

**Query Parameters:**
- `provider`: Filter by provider (BHUVAN, VEDAS, MOSDAC)
- `bbox`: Bounding box filter (minLon,minLat,maxLon,maxLat)
- `start_date`: Start date filter (ISO 8601)
- `end_date`: End date filter (ISO 8601)

**Response:**
```json
{
  "datasets": [
    {
      "id": "dataset-uuid",
      "name": "India Composite Imagery",
      "service_id": "bhuvan-1",
      "time_range": {
        "start": "2023-01-01T00:00:00Z",
        "end": "2023-12-31T23:59:59Z"
      },
      "resolution": 10,
      "bounds": [68.7, 8.4, 97.25, 37.6],
      "frame_count": 365
    }
  ]
}
```

#### GET /datasets/{id}
Get specific dataset details.

### Video Projects

#### POST /projects
Create a new video project.

**Request Body:**
```json
{
  "name": "Mumbai Time-lapse",
  "dataset_id": "dataset-uuid",
  "bbox": [72.8, 18.9, 72.9, 19.0],
  "time_range": {
    "start": "2023-01-01T00:00:00Z",
    "end": "2023-03-31T23:59:59Z"
  },
  "interpolation_settings": {
    "model": "RIFE",
    "frame_rate": 30,
    "quality": "high"
  }
}
```

**Response:**
```json
{
  "project": {
    "id": "project-uuid",
    "name": "Mumbai Time-lapse",
    "status": "pending",
    "created_at": "2023-01-01T00:00:00Z",
    "estimated_completion": "2023-01-01T01:30:00Z"
  }
}
```

#### GET /projects
Get user's video projects.

#### GET /projects/{id}
Get specific project details.

#### GET /projects/{id}/status
Get project processing status.

**Response:**
```json
{
  "status": "processing",
  "progress": 45,
  "stage": "frame_interpolation",
  "estimated_remaining": "00:25:30",
  "logs": [
    {
      "timestamp": "2023-01-01T00:30:00Z",
      "level": "info",
      "message": "Started frame interpolation using RIFE model"
    }
  ]
}
```

### AI Processing

#### POST /ai/interpolate
Start frame interpolation process.

**Request Body:**
```json
{
  "project_id": "project-uuid",
  "frames": [
    "https://storage.com/frame1.jpg",
    "https://storage.com/frame2.jpg"
  ],
  "model": "RIFE",
  "settings": {
    "frame_rate": 30,
    "quality": "high",
    "gpu_acceleration": true
  }
}
```

#### GET /ai/models
Get available AI models for frame interpolation.

**Response:**
```json
{
  "models": [
    {
      "name": "RIFE",
      "version": "3.8",
      "description": "Real-Time Intermediate Flow Estimation",
      "performance": "high",
      "gpu_required": true
    },
    {
      "name": "DAIN",
      "version": "1.0",
      "description": "Depth-Aware Video Frame Interpolation",
      "performance": "medium",
      "gpu_required": true
    }
  ]
}
```

### Chat/Assistant

#### POST /chat/message
Send message to AI assistant.

**Request Body:**
```json
{
  "message": "Help me find agricultural datasets for Maharashtra",
  "context": {
    "current_page": "datasets",
    "user_location": [19.0760, 72.8777]
  }
}
```

**Response:**
```json
{
  "response": "I can help you find agricultural datasets for Maharashtra. VEDAS provides excellent crop monitoring data for this region...",
  "suggestions": [
    {
      "action": "select_dataset",
      "dataset_id": "vedas-maharashtra-1",
      "label": "View VEDAS Maharashtra Dataset"
    }
  ],
  "metadata": {
    "intent": "dataset_selection",
    "confidence": 0.95
  }
}
```

### File Management

#### POST /files/upload
Upload satellite imagery files.

**Request:** Multipart form data with file(s)

**Response:**
```json
{
  "files": [
    {
      "id": "file-uuid",
      "filename": "satellite_image.tif",
      "size": 1048576,
      "url": "https://storage.com/file-uuid",
      "metadata": {
        "width": 1024,
        "height": 1024,
        "bands": 3,
        "projection": "EPSG:4326"
      }
    }
  ]
}
```

#### GET /files/{id}/download
Download processed video or image files.

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid bounding box coordinates",
    "details": {
      "field": "bbox",
      "provided": "invalid_coords",
      "expected": "minLon,minLat,maxLon,maxLat"
    }
  }
}
```

### Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Authentication required or failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded
- `PROCESSING_ERROR`: AI processing failed
- `STORAGE_ERROR`: File storage operation failed

## Rate Limits

- **Standard users**: 100 requests/hour
- **Premium users**: 1000 requests/hour
- **Video processing**: 5 concurrent projects

## Webhooks

Subscribe to project status updates:

#### POST /webhooks/subscribe

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/project-status",
  "events": ["project.completed", "project.failed"],
  "secret": "webhook_secret"
}
```

### Webhook Events

- `project.started`: Video generation started
- `project.progress`: Processing progress update
- `project.completed`: Video generation completed
- `project.failed`: Processing failed
- `dataset.updated`: New data available

## SDKs and Libraries

### Python SDK
```python
from webgis_ai import Client

client = Client(api_key="your_api_key")
project = client.create_project({
    "name": "Test Project",
    "dataset_id": "dataset-123"
})
```

### JavaScript SDK
```javascript
import { WebGISClient } from 'webgis-ai-sdk';

const client = new WebGISClient('your_api_key');
const project = await client.createProject({
    name: 'Test Project',
    datasetId: 'dataset-123'
});
```

## Support

For API support, contact:
- Email: api-support@webgis-ai.com
- Documentation: https://docs.webgis-ai.com
- Status Page: https://status.webgis-ai.com