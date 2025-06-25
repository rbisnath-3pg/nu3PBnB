import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map view changes
function MapViewUpdater({ listings }) {
  const map = useMap();
  
  useEffect(() => {
    if (listings.length > 0) {
      const bounds = L.latLngBounds(
        listings.map(listing => [listing.latitude, listing.longitude])
      );
      map.fitBounds(bounds, { padding: [20, 20] });
      console.log('MapViewUpdater: fitted bounds for', listings.length, 'listings');
    }
  }, [listings, map]);

  return null;
}

const Map = ({ listings, onListingClick, selectedListing }) => {
  const [mapKey, setMapKey] = useState(0);
  const [mapError, setMapError] = useState(false);

  // Center of Canada as default
  const defaultCenter = [56.1304, -106.3468];
  const defaultZoom = 4;

  useEffect(() => {
    // Force map re-render when listings change
    setMapKey(prev => prev + 1);
    setMapError(false);
    console.log('Map component: listings updated', listings?.length);
  }, [listings]);

  useEffect(() => {
    console.log('Map component mounted');
    console.log('Leaflet available:', typeof L !== 'undefined');
    console.log('React Leaflet available:', typeof MapContainer !== 'undefined');
  }, []);

  if (mapError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600 dark:text-gray-400">Failed to load map</p>
          <button 
            onClick={() => {
              setMapError(false);
              setMapKey(prev => prev + 1);
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-gray-600 dark:text-gray-400">No listings available to show on map</p>
        </div>
      </div>
    );
  }

  // Filter out listings without coordinates
  const validListings = listings.filter(listing => 
    listing.latitude && listing.longitude && 
    !isNaN(listing.latitude) && !isNaN(listing.longitude)
  );

  if (validListings.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">📍</div>
          <p className="text-gray-600 dark:text-gray-400">No listings with valid coordinates</p>
        </div>
      </div>
    );
  }

  console.log('Map component: rendering with', validListings.length, 'valid listings');

  return (
    <div className="h-full w-full relative" style={{ minHeight: '400px' }}>
      <MapContainer
        key={mapKey}
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full rounded-lg"
        style={{ 
          minHeight: '400px', 
          height: '100%',
          zIndex: 1,
          position: 'relative'
        }}
        whenCreated={(map) => {
          console.log('Map created successfully');
        }}
        whenReady={() => {
          console.log('Map is ready');
        }}
        onError={() => {
          console.error('Map failed to load');
          setMapError(true);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapViewUpdater listings={validListings} />
        
        {validListings.map((listing) => (
          <Marker
            key={listing._id}
            position={[listing.latitude, listing.longitude]}
            icon={customIcon}
            eventHandlers={{
              click: () => onListingClick && onListingClick(listing),
            }}
          >
            <Popup>
              <div className="max-w-xs">
                <div className="mb-2">
                  {listing.photos && listing.photos.length > 0 && (
                    <img
                      src={listing.photos[0]}
                      alt={listing.title}
                      className="w-full h-24 object-cover rounded mb-2"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
                      }}
                    />
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{listing.location}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-600 font-semibold">${listing.price}/night</span>
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-sm">★</span>
                    <span className="text-sm text-gray-600 ml-1">
                      {listing.averageRating || 'New'}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm line-clamp-2">{listing.description}</p>
                <button
                  onClick={() => onListingClick && onListingClick(listing)}
                  className="mt-2 w-full bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map; 