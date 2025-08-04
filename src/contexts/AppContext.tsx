import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WMSService, VideoProject, SatelliteDataset, MapViewState } from '../types';

interface AppContextType {
  wmsServices: WMSService[];
  selectedDataset: SatelliteDataset | null;
  videoProjects: VideoProject[];
  mapViewState: MapViewState;
  sidebarOpen: boolean;
  chatOpen: boolean;
  setSelectedDataset: (dataset: SatelliteDataset | null) => void;
  setMapViewState: (state: MapViewState) => void;
  setSidebarOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  addVideoProject: (project: VideoProject) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

const mockWMSServices: WMSService[] = [
  {
    id: 'bhuvan-1',
    name: 'BHUVAN Satellite Imagery',
    url: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
    layers: ['bhuvan:composite_india'],
    description: 'High-resolution satellite imagery from ISRO BHUVAN',
    bounds: [68.7, 8.4, 97.25, 37.6],
    provider: 'BHUVAN'
  },
  {
    id: 'vedas-1',
    name: 'VEDAS Agricultural Data',
    url: 'https://vedas.sac.gov.in/wms',
    layers: ['vedas:ndvi', 'vedas:crop_mask'],
    description: 'Agricultural monitoring and crop assessment data',
    bounds: [68.7, 8.4, 97.25, 37.6],
    provider: 'VEDAS'
  },
  {
    id: 'mosdac-1',
    name: 'MOSDAC Ocean Data',
    url: 'https://mosdac.gov.in/wms',
    layers: ['mosdac:sst', 'mosdac:chlorophyll'],
    description: 'Ocean color and sea surface temperature data',
    bounds: [68.7, 8.4, 97.25, 37.6],
    provider: 'MOSDAC'
  }
];

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [wmsServices] = useState<WMSService[]>(mockWMSServices);
  const [selectedDataset, setSelectedDataset] = useState<SatelliteDataset | null>(null);
  const [videoProjects, setVideoProjects] = useState<VideoProject[]>([]);
  const [mapViewState, setMapViewState] = useState<MapViewState>({
    center: [78.9629, 20.5937], // Center of India
    zoom: 5,
    rotation: 0
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  const addVideoProject = (project: VideoProject) => {
    setVideoProjects(prev => [...prev, project]);
  };

  return (
    <AppContext.Provider value={{
      wmsServices,
      selectedDataset,
      videoProjects,
      mapViewState,
      sidebarOpen,
      chatOpen,
      setSelectedDataset,
      setMapViewState,
      setSidebarOpen,
      setChatOpen,
      addVideoProject
    }}>
      {children}
    </AppContext.Provider>
  );
};