import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import LocalShippingIcon from '@mui/icons-material/LocalShipping'; // Delivery truck icon
import { createRoot } from 'react-dom/client';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapboxMap = ({ lat, lng }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const markerRootRef = useRef(null); // For React root
  const lastZoomRef = useRef(12);
  const [radius, setRadius] = useState(2000); // meters, start at 2km
  const [zoom, setZoom] = useState(12); // Track zoom for dynamic marker size
  const center = [lng || 77.2090, lat || 28.6139];

  // Animate the radius (2km to 10km)
  useEffect(() => {
    let growing = true;
    const interval = setInterval(() => {
      setRadius(r => {
        if (growing && r >= 10000) growing = false;
        if (!growing && r <= 2000) growing = true;
        return growing ? r + 200 : r - 200;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Initialize map
  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center,
      zoom: 12
    });

    map.current.on('load', () => {
      // Add animated circle source/layer
      map.current.addSource('circle', {
        type: 'geojson',
        data: createCircle(center, radius)
      });
      map.current.addLayer({
        id: 'circle-fill',
        type: 'fill',
        source: 'circle',
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.2
        }
      });
      // Add custom marker (delivery truck icon)
      addOrUpdateMarker(center, map.current.getZoom(), true);
    });

    // Listen for zoom events to update marker size
    const handleZoom = () => {
      if (map.current) {
        setZoom(map.current.getZoom());
      }
    };
    map.current.on('zoom', handleZoom);

    return () => {
      if (map.current) {
        map.current.off('zoom', handleZoom);
        map.current.remove();
        map.current = null;
      }
      markerRef.current = null;
      markerRootRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update circle when center or radius changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    // Update circle
    const source = map.current.getSource('circle');
    if (source) {
      source.setData(createCircle(center, radius));
    }
    // Move marker (but don't recreate)
    if (markerRef.current) {
      markerRef.current.setLngLat(center);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], radius]);

  // Only re-center the map when lat/lng props change (not on every radius update)
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    map.current.setCenter(center);
  }, [center[0], center[1]]);

  // Dynamically update marker size on zoom
  useEffect(() => {
    if (!map.current || !markerRef.current) return;
    const currentZoom = map.current.getZoom();
    if (lastZoomRef.current === currentZoom) return;
    lastZoomRef.current = currentZoom;
    updateMarkerSize(currentZoom);
  }, [zoom]);

  // Helper: create a GeoJSON circle
  function createCircle(center, radiusInMeters, points = 64) {
    const [lng, lat] = center;
    const coords = [];
    for (let i = 0; i < points; i++) {
      const angle = (i * 360) / points;
      const offsetX = radiusInMeters * Math.cos((angle * Math.PI) / 180);
      const offsetY = radiusInMeters * Math.sin((angle * Math.PI) / 180);
      // Approximate meters to degrees
      const deltaLng = offsetX / (111320 * Math.cos((lat * Math.PI) / 180));
      const deltaLat = offsetY / 110540;
      coords.push([lng + deltaLng, lat + deltaLat]);
    }
    coords.push(coords[0]);
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coords]
          }
        }
      ]
    };
  }

  // Helper: add or update the custom marker (delivery truck icon)
  function addOrUpdateMarker(center, zoomLevel, forceCreate = false) {
    if (!map.current) return;
    // Calculate marker/icon size based on zoom (tweak as needed)
    const minSize = 28, maxSize = 64, minZoom = 10, maxZoom = 16;
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel || 12));
    const size = minSize + ((clampedZoom - minZoom) / (maxZoom - minZoom)) * (maxSize - minSize);
    if (markerRef.current && !forceCreate) {
      markerRef.current.setLngLat(center);
      updateMarkerSize(zoomLevel);
      return;
    }
    // Create marker DOM
    const markerDiv = document.createElement('div');
    markerDiv.style.display = 'flex';
    markerDiv.style.alignItems = 'center';
    markerDiv.style.justifyContent = 'center';
    markerDiv.style.width = markerDiv.style.height = `${size + 12}px`;
    markerDiv.style.background = 'rgba(255,255,255,0.9)';
    markerDiv.style.borderRadius = '50%';
    markerDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
    // Use a persistent React root for the icon
    markerRootRef.current = createRoot(markerDiv);
    markerRootRef.current.render(
      <LocalShippingIcon sx={{ fontSize: size, color: 'red' }} />
    );
    markerRef.current = new mapboxgl.Marker(markerDiv).setLngLat(center).addTo(map.current);
  }

  // Helper: update marker size/icon without recreating marker
  function updateMarkerSize(zoomLevel) {
    if (!markerRef.current || !markerRootRef.current) return;
    const minSize = 28, maxSize = 64, minZoom = 10, maxZoom = 16;
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoomLevel || 12));
    const size = minSize + ((clampedZoom - minZoom) / (maxZoom - minZoom)) * (maxSize - minSize);
    const markerDiv = markerRef.current.getElement();
    markerDiv.style.width = markerDiv.style.height = `${size + 12}px`;
    markerRootRef.current.render(
      <LocalShippingIcon sx={{ fontSize: size, color: 'red' }} />
    );
  }

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapboxMap;