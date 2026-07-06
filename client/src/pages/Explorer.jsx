import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import DestinationCard from '../components/DestinationCard';
import VibeSearchBar from '../components/VibeSearchBar'; // Re-use search bar at top
import { Loader } from 'lucide-react';

const Explorer = () => {
    const [searchParams] = useSearchParams();
    const q = searchParams.get('q');
    const filter = searchParams.get('filter');
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDestinations = async () => {
            setLoading(true);
            try {
                let url = 'http://localhost:5000/api/destinations';
                const params = new URLSearchParams();

                if (q) params.append('q', q);
                if (filter === 'hidden_gem') params.append('isHiddenGem', 'true');

                // If we have search term use search endpoint, otherwise list endpoint with filters
                if (q) {
                    url = `http://localhost:5000/api/destinations/search?q=${encodeURIComponent(q)}`;
                    // Search endpoint might not handle isHiddenGem filter yet, so we rely on backend or client filter
                } else {
                    if (params.toString()) url += `?${params.toString()}`;
                }

                const res = await axios.get(url);
                setDestinations(res.data);
            } catch (error) {
                console.error("Error fetching destinations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDestinations();
    }, [q, filter]);

    return (
        <div className="min-h-screen bg-gray-50 pt-6">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <VibeSearchBar />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <Loader className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-gray-500 animate-pulse">Scanning the globe for vibes...</p>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {q ? `Results for "${q}"` : "Explore All Destinations"}
                            </h2>
                            <span className="text-gray-500 text-sm">{destinations.length} places found</span>
                        </div>

                        {destinations.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                No destinations found. Try searching for something else!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                {destinations.map(dest => (
                                    <DestinationCard key={dest._id} destination={dest} />
                                ))}
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default Explorer;
