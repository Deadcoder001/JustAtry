import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap
} from "react-leaflet";
import L from "leaflet";
import SeasonFilter from "./SeasonFilter";

const meghalayaCenter = [25.467, 91.366]; // Center of Meghalaya

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

// Custom user location icon
const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// OpenRouteService API key
const ORS_API_KEY = "27adb7b376394cfdb170c9b1b720cf7b";

// Function to calculate distance using Haversine formula
function haversine(lat1, lon1, lat2, lon2) {
  function toRad(x) { return (x * Math.PI) / 180; }
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper component to fit map to route
function MapUpdater({ route }) {
  const map = useMap();
  
  useEffect(() => {
    if (route && route.length > 0) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, route]);
  
  return null;
}

// Helper component to recenter map when user location changes
function MapRecenter({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, 12);
    }
  }, [map, position]);
  
  return null;
}

// Location search component
function LocationSearch({ onLocationSelected }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  
  const searchLocation = async () => {
    if (!query.trim()) return;
    
    setSearching(true);
    setError(null);
    
    try {
      // Using Nominatim for geocoding (OpenStreetMap's service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search location');
      }
      
      const data = await response.json();
      setResults(data);
      
      if (data.length === 0) {
        setError('No locations found. Try a different search term.');
      }
    } catch (err) {
      console.error('Location search error:', err);
      setError('Error searching for location. Please try again.');
    } finally {
      setSearching(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      searchLocation();
    }
  };
  
  const handleResultClick = (result) => {
    onLocationSelected([parseFloat(result.lat), parseFloat(result.lon)], result.display_name);
    setResults([]);
    setQuery('');
  };
  
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '400px'
    }}>
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          placeholder="Search for a location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
        />
        <button
          onClick={searchLocation}
          disabled={searching || !query.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: searching || !query.trim() ? 'not-allowed' : 'pointer',
            opacity: searching || !query.trim() ? 0.7 : 1
          }}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {error && (
        <div style={{
          color: '#e74c3c',
          fontSize: '14px',
          marginTop: '8px'
        }}>
          {error}
        </div>
      )}
      
      {results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderRadius: '4px',
          marginTop: '4px',
          zIndex: 1000,
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {results.map((result) => (
            <div
              key={result.place_id}
              onClick={() => handleResultClick(result)}
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {result.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MapView() {
  // Location related state
  const [userLoc, setUserLoc] = useState(null);
  const [locationName, setLocationName] = useState("No location selected");
  const [gpsStatus, setGpsStatus] = useState(null); // null, "requesting", "granted", "denied"
  const [showLocationSelector, setShowLocationSelector] = useState(true);
  
  // Places and filtering state
  const [places, setPlaces] = useState([]);
  const [radius, setRadius] = useState(20);
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  
  // Route state
  const [route, setRoute] = useState(null);
  const [destination, setDestination] = useState(null);
  const [travelInfo, setTravelInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [transportMode, setTransportMode] = useState('driving-car');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hotel search state
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [nearbyHotels, setNearbyHotels] = useState([]);
  const [hotelSearchLoading, setHotelSearchLoading] = useState(false);
  
  // Request GPS location
  const requestGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setGpsStatus("denied");
      return;
    }
    
    setGpsStatus("requesting");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLoc([latitude, longitude]);
        setLocationName("Your current location");
        setGpsStatus("granted");
        setShowLocationSelector(false);
      },
      (error) => {
        console.error("Error getting geolocation:", error);
        setGpsStatus("denied");
        alert(`Unable to retrieve your location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  
  // Handle location selection from search
  const handleLocationSelected = (coordinates, name) => {
    setUserLoc(coordinates);
    setLocationName(name);
    setShowLocationSelector(false);
  };
  
  // Reset location selection
  const resetLocation = () => {
    setUserLoc(null);
    setLocationName("No location selected");
    setShowLocationSelector(true);
    clearRoute();
  };
  
  // Fetch places based on season
  useEffect(() => {
    fetch(`/api/places?season=${selectedSeason}`)
      .then(res => res.json())
      .then(data => setPlaces(data));
  }, [selectedSeason]);

  // Filter places by radius from user
  useEffect(() => {
    if (userLoc) {
      setFilteredPlaces(
        places.filter(
          (p) =>
            haversine(userLoc[0], userLoc[1], p.latitude, p.longitude) <= radius
        )
      );
    } else {
      setFilteredPlaces([]);
    }
  }, [places, userLoc, radius]);

  // Function to get directions - now using OSRM by default
  const getDirections = async (place) => {
    if (!userLoc) return;
    
    setRouteLoading(true);
    setDestination(place);
    setRouteError(null);
    
    try {
      // Map the transport mode from OpenRouteService format to OSRM format
      const profile = transportMode === 'foot-walking' ? 'foot' : 
                      transportMode === 'cycling-regular' ? 'bike' : 'car';
      
      console.log(`Getting ${profile} directions from [${userLoc[0]}, ${userLoc[1]}] to [${place.latitude}, ${place.longitude}]`);
      
      // Format: /route/v1/{profile}/{coordinates}?options
      const coordinates = `${userLoc[1]},${userLoc[0]};${place.longitude},${place.latitude}`;
      const response = await fetch(`https://router.project-osrm.org/route/v1/${profile}/${coordinates}?overview=full&geometries=polyline`);
      
      if (!response.ok) {
        throw new Error(`OSRM API returned ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        // Decode Google polyline format
        const decodedRoute = decodePolyline(data.routes[0].geometry);
        setRoute(decodedRoute);
        
        // Get travel info
        const duration = data.routes[0].duration;
        const distance = data.routes[0].distance;
        
        setTravelInfo({
          duration: formatDuration(duration),
          distance: (distance / 1000).toFixed(1)
        });
      } else {
        // If OSRM fails, try OpenRouteService as fallback
        tryOpenRouteService(place);
      }
    } catch (error) {
      console.error("Error getting OSRM directions:", error);
      // Try OpenRouteService as fallback
      tryOpenRouteService(place);
    } finally {
      if (routeLoading) {
        setRouteLoading(false);
      }
    }
  };

  // Fallback to OpenRouteService if OSRM fails
  const tryOpenRouteService = async (place) => {
    try {
      const response = await fetch(`https://api.openrouteservice.org/v2/directions/${transportMode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': ORS_API_KEY
        },
        body: JSON.stringify({
          coordinates: [
            [userLoc[1], userLoc[0]],
            [place.longitude, place.latitude]
          ],
          format: 'geojson',
          instructions: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenRouteService API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const routeCoordinates = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoute(routeCoordinates);
        
        const duration = data.features[0].properties.summary.duration;
        const distance = data.features[0].properties.summary.distance;
        
        setTravelInfo({
          duration: formatDuration(duration),
          distance: (distance / 1000).toFixed(1)
        });
      } else {
        setRouteError("No route found for this journey");
      }
    } catch (error) {
      console.error("Error getting OpenRouteService directions:", error);
      setRouteError(`Failed to get directions: ${error.message}`);
    }
  };

  // Decode Google polyline format
  function decodePolyline(encoded) {
    var points = []
    var index = 0, len = encoded.length;
    var lat = 0, lng = 0;
    
    while (index < len) {
      var b, shift = 0, result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      
      shift = 0;
      result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      
      points.push([lat * 1e-5, lng * 1e-5]);
    }
    
    return points;
  }

  // Clear route
  const clearRoute = () => {
    setRoute(null);
    setDestination(null);
    setTravelInfo(null);
    setRouteError(null);
  };

  // Format seconds to hours and minutes
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    } else {
      return `${minutes} min`;
    }
  };
  
  // Handle search
  const handleSearch = async () => {
    if (searchTerm.trim() === '') return;
    
    try {
      const response = await fetch(`/api/places?search=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error(`Search request failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Search results:", data);
      
      if (data.length > 0) {
        setPlaces(data);
        
        // Check if searching for a state or district (like "Meghalaya" or "Guwahati")
        const searchLower = searchTerm.toLowerCase();
        const isStateOrDistrict = data.some(p => 
          p.state.toLowerCase() === searchLower || 
          p.district.toLowerCase() === searchLower
        );
        
        if (isStateOrDistrict) {
          // Find a central location in the state/district
          let centerLat = 0;
          let centerLon = 0;
          
          data.forEach(p => {
            centerLat += p.latitude;
            centerLon += p.longitude;
          });
          
          centerLat /= data.length;
          centerLon /= data.length;
          
          setUserLoc([centerLat, centerLon]);
          setLocationName(`${searchTerm} (center)`);
          setShowLocationSelector(false);
          
          // Calculate a good zoom level based on number of places
          if (userLoc) {
            // MapRecenter component will handle zooming
          }
          
          console.log(`Set center to [${centerLat}, ${centerLon}] for ${searchTerm}`);
        } else if (data.length === 1) {
          // If only one specific place found, center on it
          setUserLoc([data[0].latitude, data[0].longitude]);
          setLocationName(data[0].name);
          setShowLocationSelector(false);
        }
        
        // Update filtered places
        if (userLoc) {
          setFilteredPlaces(
            data.filter(p => haversine(userLoc[0], userLoc[1], p.latitude, p.longitude) <= radius)
          );
        } else {
          setFilteredPlaces(data);
        }
      } else {
        alert('No places found matching your search');
      }
    } catch (error) {
      console.error('Error searching places:', error);
      alert(`Search failed: ${error.message}`);
    }
  };

  // Handle find hotels button click
  const handleFindHotels = async (place) => {
    setSelectedPlace(place);
    setShowHotelModal(true);
    setHotelSearchLoading(true);
    
    try {
      // Use the fetchNearbyHotels function that's already defined in your file
      const hotels = await fetchNearbyHotels(place);
      setNearbyHotels(hotels);
      console.log(`Found ${hotels.length} accommodations near ${place.name}`);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      // Don't show an alert, just log the error and continue
      setNearbyHotels([]);
    } finally {
      setHotelSearchLoading(false);
    }
  };

  // Helper function to open external links
  const openExternalLink = (url) => {
    // Using the proper browser command for the dev container
    const command = `"$BROWSER" "${url}"`;
    console.log("Opening URL:", url);
    
    // For browser environments
    window.open(url, '_blank');
  };

  // Example Overpass API query for future reference
  const fetchNearbyHotels = async (place) => {
    const radius = 3000; // 3km radius - slightly larger to find more results
    const query = `
      [out:json];
      (
        node["tourism"="hotel"](around:${radius},${place.latitude},${place.longitude});
        node["tourism"="hostel"](around:${radius},${place.latitude},${place.longitude});
        node["tourism"="guest_house"](around:${radius},${place.latitude},${place.longitude});
        node["tourism"="apartment"](around:${radius},${place.latitude},${place.longitude});
        node["tourism"="resort"](around:${radius},${place.latitude},${place.longitude});
      );
      out body;
    `;
    
    try {
      console.log(`Searching for accommodations within ${radius}m of ${place.name}`);
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      
      if (!response.ok) {
        throw new Error(`Overpass API returned ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.elements?.length || 0} accommodation results`);
      return data.elements || [];
    } catch (error) {
      console.error('Error fetching accommodations from Overpass API:', error);
      return [];
    }
  };

  return (
    <div style={{ width: "100%", height: "calc(100vh - 60px)", position: "relative" }}>
      {/* Location selection modal */}
      {showLocationSelector && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '24px', textAlign: 'center' }}>
              Choose Your Starting Location
            </h2>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <button 
                onClick={requestGPS}
                disabled={gpsStatus === "requesting"}
                style={{
                  padding: '12px',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: gpsStatus === "requesting" ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span role="img" aria-label="GPS icon" style={{ fontSize: '20px' }}>📍</span>
                {gpsStatus === "requesting" ? "Requesting Location..." : "Use My Current Location"}
              </button>
              
              <div style={{
                textAlign: 'center',
                margin: '8px 0',
                fontSize: '14px',
                color: '#7f8c8d'
              }}>
                - OR -
              </div>
              
              <div>
                <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Search for a location</h3>
                <LocationSearch onLocationSelected={handleLocationSelected} />
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <button 
                  onClick={() => {
                    setUserLoc(meghalayaCenter);
                    setLocationName("Default Meghalaya location");
                    setShowLocationSelector(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3498db',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Use default Meghalaya location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters section */}
      <div style={{
        padding: "1rem",
        background: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        flexWrap: "wrap"
      }}>
        <SeasonFilter onSeasonChange={setSelectedSeason} />
        
        {/* Add search input */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search places or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ 
              padding: "6px 10px", 
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "200px"
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "6px 12px",
              background: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Search
          </button>
        </div>
        
        <label>
          <b>Radius:</b>
          <select
            style={{ marginLeft: "0.5rem", padding: "2px 8px", borderRadius: "4px" }}
            value={radius}
            onChange={e => setRadius(Number(e.target.value))}
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={50}>50 km</option>
          </select>
        </label>
        
        <label>
          <b>Transport:</b>
          <select
            style={{ marginLeft: "0.5rem", padding: "2px 8px", borderRadius: "4px" }}
            value={transportMode}
            onChange={e => setTransportMode(e.target.value)}
            disabled={!userLoc}
          >
            <option value="driving-car">Car</option>
            <option value="foot-walking">Walking</option>
            <option value="cycling-regular">Cycling</option>
          </select>
        </label>
        
        {userLoc && (
          <button
            onClick={resetLocation}
            style={{
              padding: "4px 8px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "13px"
            }}
          >
            <span role="img" aria-label="Change location">📍</span>
            Change Location
          </button>
        )}
        
        {routeError && (
          <div style={{ 
            marginLeft: "auto",
            background: "#ffebee",
            padding: "5px 10px",
            borderRadius: "4px",
            border: "1px solid #ffcdd2",
            color: "#c62828"
          }}>
            {routeError} 
            <button 
              onClick={() => getOSRMDirections(destination)}
              style={{
                marginLeft: "8px",
                background: "#c62828",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "2px 8px",
                cursor: "pointer"
              }}
            >
              Try alternative
            </button>
          </div>
        )}
        
        {destination && !routeError && (
          <div style={{ 
            marginLeft: "auto",
            display: "flex", 
            alignItems: "center", 
            background: "#e3f2fd", 
            padding: "5px 10px", 
            borderRadius: "4px",
            border: "1px solid #bbdefb"
          }}>
            <div>
              <span style={{ fontWeight: "bold" }}>Route to: {destination.name}</span>
              {travelInfo && (
                <span style={{ marginLeft: "10px", fontSize: "0.9em" }}>
                  ({travelInfo.distance} km, {travelInfo.duration})
                </span>
              )}
            </div>
            <button 
              onClick={clearRoute}
              style={{
                marginLeft: "10px",
                background: "#bbdefb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "2px 8px",
                cursor: "pointer"
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>
      
      {/* Map */}
      {!userLoc && !showLocationSelector ? (
        <div style={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          backgroundColor: "#f5f5f5"
        }}>
          <div style={{
            fontSize: "20px",
            marginBottom: "16px"
          }}>
            Please select a location to view the map
          </div>
          <button
            onClick={() => setShowLocationSelector(true)}
            style={{
              padding: "12px 24px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            Choose Location
          </button>
        </div>
      ) : (
        <MapContainer
          center={userLoc || meghalayaCenter}
          zoom={userLoc ? 12 : 9}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {userLoc && (
            <>
              <Marker position={userLoc} icon={userLocationIcon}>
                <Popup>
                  <b>Starting Location</b>
                  <p style={{ margin: "4px 0" }}>{locationName}</p>
                  <p style={{ margin: "4px 0", fontSize: "12px" }}>Coordinates: {userLoc[0].toFixed(4)}, {userLoc[1].toFixed(4)}</p>
                </Popup>
              </Marker>
              <Circle
                center={userLoc}
                radius={radius * 1000}
                pathOptions={{ color: "red", fillOpacity: 0.1 }}
              />
            </>
          )}
          
          {filteredPlaces.map((p) => (
            <Marker key={p.id} position={[p.latitude, p.longitude]}>
              <Popup>
                <div style={{ width: "200px" }}>
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "6px", marginBottom: "6px" }}
                  />
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{p.name}</div>
                  <div style={{ fontSize: "0.95em", marginBottom: "4px" }}>{p.description}</div>
                  <div style={{ fontSize: "0.85em", color: "#666", marginBottom: "8px" }}>
                    <b>Best Season:</b> {p.season === 'all' ? 'All year' : p.season}
                  </div>
                  
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    gap: "6px",
                    marginBottom: "8px"
                  }}>
                    <button 
                      onClick={() => handleFindHotels(p)}
                      style={{
                        background: "#ff9800",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "0.85em",
                        flex: 1
                      }}
                    >
                      <span role="img" aria-label="hotel" style={{marginRight: "4px"}}>🏨</span>
                      Find Hotels
                    </button>
                    
                    {userLoc && (
                      <button 
                        onClick={() => getDirections(p)}
                        disabled={routeLoading}
                        style={{
                          background: "#4caf50",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: "0.85em",
                          flex: 1
                        }}
                      >
                        {routeLoading ? "Loading..." : "Get Directions"}
                      </button>
                    )}
                  </div>
                  
                  {userLoc && (
                    <div style={{ fontSize: "0.85em" }}>
                      <b>Distance:</b>{" "}
                      {haversine(userLoc[0], userLoc[1], p.latitude, p.longitude).toFixed(1)}{" "}
                      km
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          
          {route && (
            <Polyline 
              positions={route} 
              color="#2196f3"
              weight={5}
              opacity={0.7}
            />
          )}
          
          {/* Helper components */}
          <MapUpdater route={route} />
          <MapRecenter position={userLoc} />
        </MapContainer>
      )}
      
      {/* Hotel search modal */}
      {showHotelModal && selectedPlace && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 2000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{ margin: 0 }}>
                Accommodations near {selectedPlace.name}
              </h2>
              <button
                onClick={() => setShowHotelModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            
            {hotelSearchLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div>Searching for accommodations...</div>
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  This may take a few moments
                </div>
              </div>
            ) : (
              <>
                {nearbyHotels.length > 0 ? (
                  <>
                    <p>Found {nearbyHotels.length} accommodations near {selectedPlace.name}:</p>
                    <div style={{ 
                      maxHeight: '300px', 
                      overflowY: 'auto',
                      border: '1px solid #eee',
                      borderRadius: '4px',
                      marginBottom: '15px'
                    }}>
                      {nearbyHotels.map((hotel, index) => (
                        <div key={index} style={{
                          padding: '10px',
                          borderBottom: index < nearbyHotels.length - 1 ? '1px solid #eee' : 'none',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <div style={{ marginRight: '10px', fontSize: '24px' }}>
                            {hotel.tags && hotel.tags.tourism === 'hostel' ? '🛏️' : '🏨'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{hotel.tags?.name || 'Unnamed Accommodation'}</div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              {hotel.tags?.tourism === 'hostel' ? 'Hostel' : 'Hotel'} • 
                              {hotel.tags?.['addr:street'] ? ` ${hotel.tags['addr:street']}` : ' No address available'}
                            </div>
                            <button
                              onClick={() => openExternalLink(`https://www.openstreetmap.org/node/${hotel.id}`)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#4285F4',
                                padding: '5px 0',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '14px'
                              }}
                            >
                              View on OpenStreetMap
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p>No accommodations found in our database. Use these services to find places to stay:</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => openExternalLink(`https://www.google.com/maps/search/hotels+near+${encodeURIComponent(selectedPlace.name)}/@${selectedPlace.latitude},${selectedPlace.longitude},14z`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#4285F4',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ marginRight: '8px', fontSize: '20px' }}>🗺️</span>
                    Search on Google Maps
                  </button>
                  
                  <button
                    onClick={() => openExternalLink(`https://www.booking.com/search.html?ss=${encodeURIComponent(selectedPlace.name)}&ssne=${encodeURIComponent(selectedPlace.name)}&ssne_untouched=${encodeURIComponent(selectedPlace.name)}&latitude=${selectedPlace.latitude}&longitude=${selectedPlace.longitude}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#003580',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ marginRight: '8px', fontSize: '20px' }}>🏨</span>
                    Search on Booking.com
                  </button>
                  
                  <button
                    onClick={() => openExternalLink(`https://www.airbnb.com/s/homes?query=${encodeURIComponent(selectedPlace.name)}&refinement_paths%5B%5D=%2Fhomes&search_type=section_navigation&ne_lat=${selectedPlace.latitude + 0.1}&ne_lng=${selectedPlace.longitude + 0.1}&sw_lat=${selectedPlace.latitude - 0.1}&sw_lng=${selectedPlace.longitude - 0.1}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#FF5A5F',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ marginRight: '8px', fontSize: '20px' }}>🏠</span>
                    Search on Airbnb
                  </button>
                  
                  <button
                    onClick={() => openExternalLink(`https://www.makemytrip.com/hotels/hotel-listing/?checkin=date_2&checkout=date_3&city=CTY&country=IN&roomStayQualifier=1e0e&locusType=city&searchText=${encodeURIComponent(selectedPlace.name)}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: '#0066BB',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ marginRight: '8px', fontSize: '20px' }}>✈️</span>
                    Search on MakeMyTrip
                  </button>
                </div>
                
                <div style={{
                  marginTop: '20px',
                  padding: '12px',
                  backgroundColor: '#f5f7fa',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Planning tips:</p>
                  <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    <li>Book accommodations in advance during peak {selectedPlace.season} season</li>
                    <li>Check reviews for cleanliness and amenities</li>
                    <li>Consider properties within {userLoc ? haversine(userLoc[0], userLoc[1], selectedPlace.latitude, selectedPlace.longitude).toFixed(1) : 5} km of this attraction</li>
                    <li>Look for places that offer local transportation options</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}