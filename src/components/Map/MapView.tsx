import React, { useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import 'ol/ol.css';
import { useApp } from '../../contexts/AppContext';

interface MapViewProps {
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({ className = '' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const { mapViewState, setMapViewState } = useApp();

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM({
            attributions: []
          })
        })
      ],
      view: new View({
        center: fromLonLat(mapViewState.center),
        zoom: mapViewState.zoom,
        rotation: mapViewState.rotation
      }),
      controls: defaultControls({
        attribution: false,
        zoom: true,
        rotate: false
      })
    });

    mapInstanceRef.current = map;

    // Listen for view changes
    const view = map.getView();
    const updateViewState = () => {
      const center = view.getCenter();
      if (center) {
        setMapViewState({
          center: fromLonLat(center) as [number, number],
          zoom: view.getZoom() || 5,
          rotation: view.getRotation() || 0
        });
      }
    };

    view.on('change:center', updateViewState);
    view.on('change:zoom', updateViewState);
    view.on('change:rotation', updateViewState);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full bg-slate-900 ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
};