import React from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapboxMap = ({ lat, lng }) => {
  const latitude = lat || 28.6139;
  const longitude = lng || 77.2090;

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Map
        initialViewState={{
          latitude,
          longitude,
          zoom: 12
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <Marker longitude={longitude} latitude={latitude} color="red" />
      </Map>
    </div>
  );
};

export default MapboxMap;