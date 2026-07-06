import React, { useState } from 'react';
import axios from 'axios';
import { Loader, Sparkles, Shirt, BookOpen, Map, ArrowRight, Heart } from 'lucide-react';
import ItineraryTimeline from '../components/ItineraryTimeline';
import { useNavigate } from 'react-router-dom';

const Planner = () => {
    const [formData, setFormData] = useState({ city: 'Kyoto', days: 3, preferences: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary', 'packing', 'etiquette'
    const navigate = useNavigate();

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            // Parallel requests for speed (Mock MVP approach)
            const itineraryReq = axios.post('http://localhost:5000/api/itinerary/generate', formData);
            // We trigger these but don't block display if itinerary is ready first
            const packingReq = axios.post('http://localhost:5000/api/itinerary/packing', {
                city: formData.city, season: 'Spring', activities: formData.preferences
            });
            const etiquetteReq = axios.post('http://localhost:5000/api/itinerary/culture', { city: formData.city });

            const [itineraryRes, packingRes, etiquetteRes] = await Promise.all([itineraryReq, packingReq, etiquetteReq]);

            setResult({
                itinerary: itineraryRes.data,
                packing: packingRes.data,
                etiquette: etiquetteRes.data
            });
        } catch (error) {
            console.error("Planning failed", error);
            alert("Something went wrong! Ensure the server is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTrip = async () => {
        if (!result) return;
        setSaving(true);
        try {
            await axios.post('http://localhost:5000/api/trips/save', {
                city: formData.city,
                summary: result.itinerary.summary,
                itinerary: result.itinerary,
                packingList: result.packing,
                etiquette: result.etiquette
            });
            alert("Trip saved successfully!");
            navigate('/saved');
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save trip.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-light">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="text-accent" /> AI Trip Planner
                    </h1>
                    <p className="text-gray-500 mt-2">Build your perfect trip in seconds using RAG technology.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Input Form */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <form onSubmit={handleGenerate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Destination City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Duration (Days)</label>
                                    <input
                                        type="number"
                                        value={formData.days}
                                        onChange={e => setFormData({ ...formData, days: parseInt(e.target.value) })}
                                        min="1" max="7"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Trip Vibe & Preferences</label>
                                    <textarea
                                        value={formData.preferences}
                                        onChange={e => setFormData({ ...formData, preferences: e.target.value })}
                                        placeholder="e.g. Peaceful temples, great matcha, avoid crowds..."
                                        className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    {loading ? "Generating Plan..." : "Generate Itinerary"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="lg:col-span-8">
                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-70">
                                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                                    <div className="h-full bg-primary animate-[shimmer_1.5s_infinite] w-full origin-left-right"></div>
                                </div>
                                <p className="text-xl font-medium text-gray-700">Curating the perfect experience...</p>
                                <p className="text-sm text-gray-500 mt-2">Checking opening hours, weather, and crowds.</p>
                            </div>
                        )}

                        {!loading && result && (
                            <div className="space-y-6">
                                {/* Tabs and Actions */}
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200 pb-2">
                                    <div className="flex gap-4 overflow-x-auto w-full md:w-auto">
                                        <TabButton active={activeTab === 'itinerary'} onClick={() => setActiveTab('itinerary')} icon={<Map size={18} />} label="Itinerary" />
                                        <TabButton active={activeTab === 'packing'} onClick={() => setActiveTab('packing')} icon={<Shirt size={18} />} label="Packing List" />
                                        <TabButton active={activeTab === 'etiquette'} onClick={() => setActiveTab('etiquette')} icon={<BookOpen size={18} />} label="Etiquette" />
                                    </div>
                                    <div className="ml-auto">
                                        <button
                                            onClick={handleSaveTrip}
                                            disabled={saving}
                                            className="btn-secondary flex items-center gap-2"
                                        >
                                            <Heart className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
                                            {saving ? 'Saving...' : 'Save Trip'}
                                        </button>
                                    </div>
                                </div>

                                {activeTab === 'itinerary' && (
                                    <div className="animate-fadeIn">
                                        <ItineraryTimeline itinerary={result.itinerary} city={formData.city} />
                                    </div>
                                )}

                                {activeTab === 'packing' && result.packing && (
                                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
                                        <h2 className="text-2xl font-bold mb-6">Packing Essentials</h2>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <ListSection title="Clothing" items={result.packing.clothing} />
                                            <ListSection title="Essentials" items={result.packing.essentials} />
                                            <ListSection title="Accessories" items={result.packing.accessories} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'etiquette' && result.etiquette && (
                                    <div className="glass-card p-8 animate-fadeIn">
                                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                                            <BookOpen className="text-amber-500" /> Cultural Etiquette
                                        </h2>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100/50">
                                                <h3 className="text-green-700 font-bold mb-4 uppercase tracking-wide flex items-center gap-2">
                                                    <span className="bg-green-100 p-1 rounded-full"><div className="w-2 h-2 bg-green-500 rounded-full"></div></span> Do's
                                                </h3>
                                                <ul className="space-y-4">
                                                    {result.etiquette.dos?.map((item, i) => (
                                                        <li key={i} className="flex gap-3 text-gray-700 items-start">
                                                            <span className="text-green-500 mt-0.5">✓</span>
                                                            <span className="font-medium">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100/50">
                                                <h3 className="text-red-600 font-bold mb-4 uppercase tracking-wide flex items-center gap-2">
                                                    <span className="bg-red-100 p-1 rounded-full"><div className="w-2 h-2 bg-red-500 rounded-full"></div></span> Don'ts
                                                </h3>
                                                <ul className="space-y-4">
                                                    {result.etiquette.donts?.map((item, i) => (
                                                        <li key={i} className="flex gap-3 text-gray-700 items-start">
                                                            <span className="text-red-500 mt-0.5">✕</span>
                                                            <span className="font-medium">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {!loading && !result && (
                            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                                <Map className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg">Enter your details to generate a trip.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${active ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100 text-gray-600'}`}
    >
        {icon} {label}
    </button>
);

const ListSection = ({ title, items }) => (
    <div>
        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-3">{title}</h3>
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

export default Planner;
