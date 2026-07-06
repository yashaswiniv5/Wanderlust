import React, { useState } from 'react';
import DistanceMap from '../components/DistanceMap';
import RouteMap from '../components/RouteMap';
import { Map, Navigation } from 'lucide-react';

import ErrorBoundary from '../components/ErrorBoundary';

const Maps = () => {
    const [activeTab, setActiveTab] = useState('distance');

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-dark flex items-center gap-2">
                <Map className="w-8 h-8 text-primary" />
                Interactive Maps
            </h1>

            <ErrorBoundary>
                <div className="flex mb-6 bg-white rounded-lg shadow p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('distance')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${activeTab === 'distance'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Map className="w-4 h-4" />
                        Distance Finder
                    </button>
                    <button
                        onClick={() => setActiveTab('route')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${activeTab === 'route'
                            ? 'bg-primary text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Navigation className="w-4 h-4" />
                        Route Finder
                    </button>
                </div>

                <div className="space-y-8">
                    {activeTab === 'distance' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <DistanceMap />
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <RouteMap />
                        </div>
                    )}
                </div>
            </ErrorBoundary>
        </div>
    );
};

export default Maps;
