import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, Trash2, X, Map, Shirt, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ItineraryTimeline from '../components/ItineraryTimeline';

const SavedTrips = () => {
    const [trips, setTrips] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [activeTab, setActiveTab] = useState('itinerary');

    useEffect(() => {
        const fetchTrips = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/trips');
                setTrips(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchTrips();
    }, []);

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent opening modal when clicking delete
        if (window.confirm("Are you sure you want to delete this trip?")) {
            try {
                await axios.delete(`http://localhost:5000/api/trips/${id}`);
                setTrips(trips.filter(t => t._id !== id));
            } catch (error) {
                console.error("Failed to delete trip", error);
                alert("Failed to delete trip. Please try again.");
            }
        }
    };

    const openTripDetails = (trip) => {
        setSelectedTrip(trip);
        setActiveTab('itinerary');
    };

    const closeModal = () => setSelectedTrip(null);

    return (
        <div className="min-h-screen bg-light py-10 px-4 relative">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Saved Adventures</h1>

                {trips.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                            ✈️
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No trips saved yet</h3>
                        <p className="text-gray-500 mb-6">Start planning your dream vacation today.</p>
                        <Link to="/planner" className="btn-primary">Create New Trip</Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {trips.map((trip, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={trip._id}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                                onClick={() => openTripDetails(trip)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(trip.createdAt).toLocaleDateString()}
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2 group-hover:text-primary transition-colors">
                                            {trip.city} <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{trip.itinerary?.days?.length || 0} Days</span>
                                        </h2>
                                        <p className="text-gray-600 line-clamp-2 max-w-2xl">{trip.summary}</p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(trip._id, e)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                        title="Delete Trip"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-teal-100 border-2 border-white flex items-center justify-center text-xs font-bold text-teal-700">IT</div>
                                        {trip.packingList && <div className="w-8 h-8 rounded-full bg-sky-100 border-2 border-white flex items-center justify-center text-xs font-bold text-sky-700">PL</div>}
                                        {trip.etiquette && <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-xs font-bold text-amber-700">ET</div>}
                                    </div>
                                    <button className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                        View Details <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Trip Details Modal */}
            <AnimatePresence>
                {selectedTrip && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedTrip.city} Trip</h2>
                                    <p className="text-gray-500 text-sm">{selectedTrip.itinerary?.days?.length} Days • Created on {new Date(selectedTrip.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Tabs */}
                            <div className="flex border-b border-gray-200 px-6">
                                <TabButton active={activeTab === 'itinerary'} onClick={() => setActiveTab('itinerary')} icon={<Map size={18} />} label="Itinerary" />
                                <TabButton active={activeTab === 'packing'} onClick={() => setActiveTab('packing')} icon={<Shirt size={18} />} label="Packing List" />
                                <TabButton active={activeTab === 'etiquette'} onClick={() => setActiveTab('etiquette')} icon={<BookOpen size={18} />} label="Etiquette" />
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50">
                                {activeTab === 'itinerary' && (
                                    <ItineraryTimeline itinerary={selectedTrip.itinerary} />
                                )}

                                {activeTab === 'packing' && selectedTrip.packingList && (
                                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                        <h3 className="text-xl font-bold mb-6">Packing List</h3>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <ListSection title="Clothing" items={selectedTrip.packingList.clothing} />
                                            <ListSection title="Essentials" items={selectedTrip.packingList.essentials} />
                                            <ListSection title="Accessories" items={selectedTrip.packingList.accessories} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'etiquette' && selectedTrip.etiquette && (
                                    <div className="glass-card p-8">
                                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                            <BookOpen className="text-amber-500" /> Cultural Etiquette
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100/50">
                                                <h4 className="text-green-700 font-bold mb-4 uppercase tracking-wide">Do's</h4>
                                                <ul className="space-y-3">
                                                    {selectedTrip.etiquette.dos?.map((item, i) => (
                                                        <li key={i} className="flex gap-3 text-gray-700 items-start">
                                                            <span className="text-green-500 font-bold">✓</span> {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100/50">
                                                <h4 className="text-red-600 font-bold mb-4 uppercase tracking-wide">Don'ts</h4>
                                                <ul className="space-y-3">
                                                    {selectedTrip.etiquette.donts?.map((item, i) => (
                                                        <li key={i} className="flex gap-3 text-gray-700 items-start">
                                                            <span className="text-red-500 font-bold">✕</span> {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-all ${active ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
    >
        {icon} {label}
    </button>
);

const ListSection = ({ title, items }) => (
    <div>
        <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">{title}</h4>
        <ul className="space-y-2">
            {items && items.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                    {item}
                </li>
            ))}
        </ul>
    </div>
);

export default SavedTrips;
