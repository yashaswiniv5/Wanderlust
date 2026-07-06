import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useEffect, useState } from "react";
import RoutingMachine from "./RoutingMachine";
import { MapPin, Navigation, ArrowRightLeft, Search } from "lucide-react";

// Fix for default marker icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, 13);
    }, [center, map]);
    return null;
}

export default function RouteMap() {
    const [userLoc, setUserLoc] = useState(null);

    const [origin, setOrigin] = useState("Your Location");
    const [destination, setDestination] = useState("");

    const [originCoords, setOriginCoords] = useState(null);
    const [destCoords, setDestCoords] = useState(null);

    const [isSearching, setIsSearching] = useState(false);

    // Get user location initially
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            const loc = [pos.coords.latitude, pos.coords.longitude];
            setUserLoc(loc);
            if (origin === "Your Location") {
                setOriginCoords(loc);
            }
        }, (err) => {
            console.error("Location access denied", err);
            // Default to London if denied, or handle gracefully
            const defaultLoc = [51.505, -0.09];
            setUserLoc(defaultLoc);
            if (origin === "Your Location") {
                setOriginCoords(defaultLoc);
            }
        });
    }, []);

    const geocode = async (query) => {
        if (!query || query === "Your Location") return userLoc;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
            const data = await res.json();
            if (data && data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
            return null;
        } catch (e) {
            console.error("Geocoding error", e);
            return null;
        }
    };

    const handleRoute = async () => {
        if (!destination) return;
        setIsSearching(true);

        const start = await geocode(origin);
        const end = await geocode(destination);

        if (start && end) {
            setOriginCoords(start);
            setDestCoords(end);
        } else {
            alert("Could not find one of the locations.");
        }
        setIsSearching(false);
    };

    const swapLocations = () => {
        const tempOrigin = origin;
        setOrigin(destination);
        setDestination(tempOrigin);
    };

    return (
        <div className="flex flex-col md:flex-row h-[600px] w-full bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">

            {/* Sidebar Controls */}
            <div className="md:w-1/3 p-6 bg-white flex flex-col z-10 shadow-lg md:shadow-none">
                <h2 className="text-2xl font-bold mb-6 text-dark flex items-center gap-2">
                    <Navigation className="text-secondary" />
                    Directions
                </h2>

                <div className="space-y-4">
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                            placeholder="Choose starting point..."
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-center -my-2 relative z-10">
                        <button
                            onClick={swapLocations}
                            className="p-1.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 hover:shadow-md transition-all text-gray-500"
                            title="Swap locations"
                        >
                            <ArrowRightLeft className="w-4 h-4 rotate-90" />
                        </button>
                    </div>

                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-red-500 w-5 h-5" />
                        <input
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                            placeholder="Choose destination..."
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    onClick={handleRoute}
                    disabled={isSearching}
                    className="mt-6 w-full bg-primary hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {isSearching ? 'Calculating...' : (
                        <>
                            <Search className="w-5 h-5" />
                            Find Route
                        </>
                    )}
                </button>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
                    <p className="font-semibold mb-1">Tip:</p>
                    <p>"Your Location" uses your current GPS position.</p>
                </div>
            </div>

            {/* Map Area */}
            <div className="md:w-2/3 h-full relative bg-gray-100">
                {originCoords ? (
                    <MapContainer
                        center={originCoords}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        className="z-0"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />

                        {originCoords && destCoords && (
                            <>
                                <RoutingMachine start={originCoords} end={destCoords} />
                                <RecenterMap center={originCoords} />
                            </>
                        )}

                        {(!destCoords && originCoords) && (
                            <Marker position={originCoords}>
                                <Popup>Starting Point</Popup>
                            </Marker>
                        )}

                    </MapContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                        <Navigation className="w-12 h-12 opacity-20" />
                        <p>Loading Map...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
