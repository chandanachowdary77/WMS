export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface WMSService {
  id: string;
  name: string;
  url: string;
  layers: string[];
  description: string;
  bounds: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  provider: 'BHUVAN' | 'VEDAS' | 'MOSDAC' | 'CUSTOM';
}

export interface SatelliteDataset {
  id: string;
  name: string;
  service: WMSService;
  timeRange: {
    start: Date;
    end: Date;
  };
  resolution: number;
  bounds: [number, number, number, number];
  frameCount: number;
}

export interface VideoProject {
  id: string;
  name: string;
  dataset: SatelliteDataset;
  interpolationSettings: {
    model: 'RIFE' | 'DAIN' | 'CUSTOM';
    frameRate: number;
    quality: 'low' | 'medium' | 'high' | 'ultra';
  };
  status: 'pending' | 'processing' | 'completed' | 'error';
  videoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  metadata?: {
    action?: string;
    data?: any;
  };
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
  rotation: number;
}

export interface BoundingBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}