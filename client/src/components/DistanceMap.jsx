import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Helper component to update map view
function RecenterMap({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export default function DistanceMap() {
    const [place, setPlace] = useState("");
    const [userLoc, setUserLoc] = useState(null);
    const [destLoc, setDestLoc] = useState(null);
    const [distance, setDistance] = useState(null);

    // Get user location on mount
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLoc([pos.coords.latitude, pos.coords.longitude]);
            },
            (err) => {
                console.error("Error getting location", err);
                // Default fallback (e.g. London) if permission denied
                setUserLoc([51.505, -0.09]);
            }
        );
    }, []);

    const findLocation = async () => {
        if (!userLoc) {
            alert("Waiting for user location...");
            return;
        }

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
            );
            const data = await res.json();

            if (!data.length) {
                alert("Place not found");
                return;
            }

            const destLat = parseFloat(data[0].lat);
            const destLng = parseFloat(data[0].lon);

            setDestLoc([destLat, destLng]);

            const dist = calculateDistance(userLoc[0], userLoc[1], destLat, destLng);
            setDistance(dist.toFixed(2));
        } catch (error) {
            console.error("Error fetching location:", error);
            alert("Error finding location");
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-primary">📍 Distance Finder with Map</h2>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Enter place name"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                />
                <button
                    onClick={findLocation}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
                >
                    Find
                </button>
            </div>

            {distance && (
                <h3 className="text-xl font-semibold mb-4 text-green-600">📏 Distance: {distance} KM</h3>
            )}

            {userLoc ? (
                <MapContainer
                    center={userLoc}
                    zoom={13}
                    style={{ height: "400px", width: "100%", borderRadius: "8px" }}
                >
                    {/* Update view when destination changes */}
                    {destLoc && <RecenterMap center={destLoc} zoom={13} />}

                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={userLoc}>
                        <Popup>Your Location</Popup>
                    </Marker>

                    {destLoc && (
                        <Marker position={destLoc}>
                            <Popup>Destination: {place}</Popup>
                        </Marker>
                    )}
                </MapContainer>
            ) : (
                <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Locating you...</p>
                </div>
            )}
        </div>
    );
}
