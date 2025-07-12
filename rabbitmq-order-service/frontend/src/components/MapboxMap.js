import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import HomeIcon from "@mui/icons-material/Home";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { createRoot } from "react-dom/client";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

// Helper: Generate 5 mock reroute destinations with 2 close (3km) and 3 further (5-8km) at varying distances
function generateNearbyPins([lng, lat], count = 5) {
  const pins = [];
  const earthRadius = 6371; // km
  const baseAngles = Array.from(
    { length: count },
    (_, i) => (2 * Math.PI * i) / count,
  );
  // Shuffle indices to pick 3 for further distance
  const indices = baseAngles.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const furtherIndices = indices.slice(0, 3);
  baseAngles.forEach((angle, i) => {
    let distanceKm = 3;
    if (furtherIndices.includes(i)) {
      distanceKm = 5 + Math.random() * 3; // 5-8km
    }
    const dLat = (distanceKm / earthRadius) * (180 / Math.PI) * Math.sin(angle);
    const dLng =
      ((distanceKm / earthRadius) * (180 / Math.PI) * Math.cos(angle)) /
      Math.cos((lat * Math.PI) / 180);
    pins.push([lng + dLng, lat + dLat]);
  });
  return pins;
}

const MapboxMap = ({ lat, lng }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markerRef = useRef(null);
  const markerRootRef = useRef(null); // For React root
  const lastZoomRef = useRef(12);
  const [radius, setRadius] = useState(2000); // meters, start at 2km
  const [zoom, setZoom] = useState(12); // Track zoom for dynamic marker size
  const center = [lng || 77.209, lat || 28.6139];

  // Reroute state
  const [reroutePins] = useState(() => generateNearbyPins(center, 5));
  const [selectedPin, setSelectedPin] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [animatedBikePos, setAnimatedBikePos] = useState(null); // [lng, lat] or null
  const animationRef = useRef();
  const animatedBikeMarkerRef = useRef(null); // DOM marker for animation

  // Animate the radius (2km to 10km)
  useEffect(() => {
    let growing = true;
    const interval = setInterval(() => {
      setRadius((r) => {
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
      style: "mapbox://styles/mapbox/streets-v11",
      center,
      zoom: 12,
    });

    map.current.on("load", () => {
      // Add animated circle source/layer
      map.current.addSource("circle", {
        type: "geojson",
        data: createCircle(center, radius),
      });
      map.current.addLayer({
        id: "circle-fill",
        type: "fill",
        source: "circle",
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.2,
        },
      });
      // Add custom marker (delivery bike icon)
      addOrUpdateMarker(center, map.current.getZoom(), true);
      // Add reroute pins (Home icons)
      reroutePins.forEach((pos, i) => addOrUpdateHomePin(pos, i));
    });

    // Listen for zoom events to update marker size
    const handleZoom = () => {
      if (map.current) {
        setZoom(map.current.getZoom());
      }
    };
    map.current.on("zoom", handleZoom);

    return () => {
      if (map.current) {
        map.current.off("zoom", handleZoom);
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
    const source = map.current.getSource("circle");
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
    updateMarkerSize();
  }, [zoom]);

  // Draw or update the route polyline
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    // Remove previous route layer/source if exists
    if (map.current.getLayer("route-line")) {
      map.current.removeLayer("route-line");
    }
    if (map.current.getSource("route")) {
      map.current.removeSource("route");
    }
    if (!routeCoords.length) return;
    map.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: routeCoords,
        },
      },
    });
    map.current.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#1976d2",
        "line-width": 5,
        "line-opacity": 0.85,
      },
    });
  }, [routeCoords]);

  // Animate bike along route when routeCoords changes
  useEffect(() => {
    if (!routeCoords.length) return;
    let i = 0;
    const increment = 0.1; // Smaller = slower, smoother
    function lerp(a, b, t) {
      return a + (b - a) * t;
    }
    function animate() {
      if (i >= routeCoords.length - 1) {
        setAnimatedBikePos(routeCoords[routeCoords.length - 1]);
        animationRef.current = null;
        return;
      }
      const idx = Math.floor(i);
      const nextIdx = Math.min(idx + 1, routeCoords.length - 1);
      const t = i - idx;
      const [lng1, lat1] = routeCoords[idx];
      const [lng2, lat2] = routeCoords[nextIdx];
      const lng = lerp(lng1, lng2, t);
      const lat = lerp(lat1, lat2, t);
      setAnimatedBikePos([lng, lat]);
      i += increment;
      animationRef.current = requestAnimationFrame(animate);
    }
    animate();
    return () =>
      animationRef.current && cancelAnimationFrame(animationRef.current);
  }, [routeCoords]);

  // Add or update the animated bike DOM marker
  useEffect(() => {
    if (!map.current) return;
    if (!animatedBikePos) {
      if (animatedBikeMarkerRef.current) {
        animatedBikeMarkerRef.current.remove();
        animatedBikeMarkerRef.current = null;
      }
      return;
    }
    // Create or update the DOM marker
    if (!animatedBikeMarkerRef.current) {
      const markerDiv = document.createElement("div");
      markerDiv.style.display = "flex";
      markerDiv.style.alignItems = "center";
      markerDiv.style.justifyContent = "center";
      markerDiv.style.width = markerDiv.style.height = "24px";
      markerDiv.style.background = "rgba(255,255,255,0.9)";
      markerDiv.style.borderRadius = "50%";
      markerDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";
      createRoot(markerDiv).render(
        <TwoWheelerIcon sx={{ fontSize: 18, color: "#FFD600" }} />,
      );
      animatedBikeMarkerRef.current = new mapboxgl.Marker(markerDiv)
        .setLngLat(animatedBikePos)
        .addTo(map.current);
    } else {
      animatedBikeMarkerRef.current.setLngLat(animatedBikePos);
    }
  }, [animatedBikePos]);

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
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [coords],
          },
        },
      ],
    };
  }

  // Helper: add or update the custom marker (delivery truck icon) at the center
  function addOrUpdateMarker(center, zoomLevel, forceCreate = false) {
    if (!map.current) return;
    // Use a visually distinct icon for the center marker
    const size = 32;
    if (markerRef.current && !forceCreate) {
      markerRef.current.setLngLat(center);
      updateMarkerSize();
      return;
    }
    if (!markerRef.current) {
      const markerDiv = document.createElement("div");
      markerDiv.style.display = "flex";
      markerDiv.style.alignItems = "center";
      markerDiv.style.justifyContent = "center";
      markerDiv.style.width = markerDiv.style.height = `${size + 12}px`;
      markerDiv.style.background = "rgba(255,255,255,0.98)";
      markerDiv.style.borderRadius = "50%";
      markerDiv.style.boxShadow = "0 2px 8px rgba(0,0,0,0.18)";
      createRoot(markerDiv).render(
        <LocalShippingIcon sx={{ fontSize: size, color: "red" }} />,
      );
      markerRef.current = new mapboxgl.Marker(markerDiv)
        .setLngLat(center)
        .addTo(map.current);
    }
  }

  // Helper: update marker size/icon without recreating marker
  function updateMarkerSize() {
    if (!markerRef.current || !markerRootRef.current) return;
    const size = 24;
    const markerDiv = markerRef.current.getElement();
    markerDiv.style.width = markerDiv.style.height = `${size + 8}px`;
    markerRootRef.current.render(
      <TwoWheelerIcon sx={{ fontSize: size, color: "#FFD600" }} />,
    );
  }

  // Helper: add or update a Home reroute pin (smaller size)
  function addOrUpdateHomePin(pos, i) {
    if (!map.current) return;
    const el = document.createElement("div");
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.width = el.style.height = "28px";
    el.style.background = "rgba(255,255,255,0.95)";
    el.style.borderRadius = "50%";
    el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.12)";
    el.style.cursor = "pointer";
    // Highlight if selected
    if (selectedPin && pos[0] === selectedPin[0] && pos[1] === selectedPin[1]) {
      el.style.border = "2px solid #1976d2";
      el.style.animation = "bounce 1s infinite";
    }
    createRoot(el).render(<HomeIcon sx={{ fontSize: 18, color: "#1976d2" }} />);
    const marker = new mapboxgl.Marker(el).setLngLat(pos).addTo(map.current);
    el.onclick = () => handleRerouteClick(pos);
    // Clean up marker on rerender (not tracked for now)
  }

  // Handle reroute pin click
  async function handleRerouteClick(target) {
    setSelectedPin(target);
    // Fetch route from Mapbox Directions API
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${center[0]},${center[1]};${target[0]},${target[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      setRouteCoords(data.routes[0].geometry.coordinates);
    } else {
      setRouteCoords([center, target]); // fallback straight line
    }
  }

  return (
    <div className="map-container" style={{ width: "100%", height: "400px" }}>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%", borderRadius: "0 0 12px 12px" }}
      />
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .map-container {
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .map-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #1976d2, #42a5f5, #1976d2);
          z-index: 1000;
          animation: progressFlow 3s ease-in-out infinite;
        }

        @keyframes progressFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default MapboxMap;
