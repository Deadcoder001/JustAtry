import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle
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

export default function MapView() {
  const [userLoc, setUserLoc] = useState(null);
  const [places, setPlaces] = useState([]);
  const [radius, setRadius] = useState(20);
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [gpsStatus, setGpsStatus] = useState("pending"); // pending, granted, denied

  // Fetch places based on season
  useEffect(() => {
    fetch(`/api/places?season=${selectedSeason}`)
      .then(res => res.json())
      .then(data => setPlaces(data));
  }, [selectedSeason]);

  // Request GPS access
  const askGPS = () => {
    setGpsStatus("pending");
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc([pos.coords.latitude, pos.coords.longitude]);
        setGpsStatus("granted");
      },
      () => {
        setUserLoc(null);
        setGpsStatus("denied");
      }
    );
  };

  // Initial GPS request on mount
  useEffect(() => {
    askGPS();
    // eslint-disable-next-line
  }, []);

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
      setFilteredPlaces(places);
    }
  }, [places, userLoc, radius]);

  return (
    <div style={{ width: "100%", height: "calc(100vh - 60px)" }}>
      {/* Filters and GPS status */}
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
        
        <label>
          <b>Radius:</b>
          <select
            style={{ marginLeft: "0.5rem", padding: "2px 8px", borderRadius: "4px" }}
            value={radius}
            onChange={e => setRadius(Number(e.target.value))}
            disabled={gpsStatus !== "granted"}
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
          </select>
        </label>
        {gpsStatus === "pending" && (
          <span style={{ color: "#999" }}>Asking for GPS...</span>
        )}
        {gpsStatus === "granted" && (
          <span style={{ color: "green", fontWeight: "bold" }}>Showing places near you</span>
        )}
        {gpsStatus === "denied" && (
          <span>
            <span style={{ color: "red", fontWeight: "bold" }}>GPS unavailable (showing all)</span>
            <button
              style={{
                marginLeft: "1rem",
                padding: "4px 10px",
                borderRadius: "4px",
                border: "1px solid #388e3c",
                background: "#c8e6c9",
                cursor: "pointer"
              }}
              onClick={askGPS}
            >
              Retry GPS
            </button>
          </span>
        )}
      </div>
      {/* Map */}
      <MapContainer
        center={userLoc || meghalayaCenter}
        zoom={9}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLoc && (
          <>
            <Marker position={userLoc}>
              <Popup>
                <b>You are here</b>
              </Popup>
            </Marker>
            <Circle
              center={userLoc}
              radius={radius * 1000}
              pathOptions={{ color: "blue", fillOpacity: 0.1 }}
            />
          </>
        )}
        {filteredPlaces.map((p) => (
          <Marker key={p.id} position={[p.latitude, p.longitude]}>
            <Popup>
              <div style={{ width: "180px" }}>
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "6px", marginBottom: "6px" }}
                />
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{p.name}</div>
                <div style={{ fontSize: "0.95em", marginBottom: "4px" }}>{p.description}</div>
                <div style={{ fontSize: "0.85em", color: "#666" }}>
                  <b>Best Season:</b> {p.season === 'all' ? 'All year' : p.season}
                </div>
                {userLoc && (
                  <div style={{ fontSize: "0.8em", marginTop: "6px" }}>
                    <b>Distance:</b>{" "}
                    {haversine(
                      userLoc[0],
                      userLoc[1],
                      p.latitude,
                      p.longitude
                    ).toFixed(2)}{" "}
                    km
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}