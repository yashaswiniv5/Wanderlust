import React, { useState } from 'react';
import VibeSearchBar from '../components/VibeSearchBar';
import VibeSearchModal from '../components/VibeSearchModal';
import { MapPin, Calendar, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    const navigate = useNavigate();
    const [isVibeModalOpen, setIsVibeModalOpen] = useState(false);

    const handleFeatureClick = (feature) => {
        switch (feature) {
            case 'hidden-gems':
                navigate('/explorer?filter=hidden_gem');
                break;
            case 'smart-itineraries':
                navigate('/planner');
                break;
            case 'vibe-search':
                setIsVibeModalOpen(true);
                break;
            default:
                break;
        }
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Vibe Search Modal */}
            <VibeSearchModal
                isOpen={isVibeModalOpen}
                onClose={() => setIsVibeModalOpen(false)}
            />

            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-teal-900 to-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] opacity-20 bg-cover bg-center"></div>
                <div className="container mx-auto px-4 py-32 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                            Travel Different with <span className="text-gradient font-extrabold">AI</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
                            Discover hidden gems, plan perfect days, and explore the world with a personalized travel assistant powered by vibe checks.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <VibeSearchBar />
                    </motion.div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900">Why Use WanderLust AI?</h2>
                    <p className="text-gray-500 mt-2">More than just a map. It's your local friend.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<MapPin className="w-8 h-8 text-primary" />}
                        title="Hidden Gems"
                        desc="We analyze millions of reviews to find 'locals only' spots that others miss."
                        delay={0.2}
                        onClick={() => handleFeatureClick('hidden-gems')}
                    />
                    <FeatureCard
                        icon={<Calendar className="w-8 h-8 text-secondary" />}
                        title="Smart Itineraries"
                        desc="Get day-by-day plans that make sense geographically and match your pace."
                        delay={0.4}
                        onClick={() => handleFeatureClick('smart-itineraries')}
                    />
                    <FeatureCard
                        icon={<Camera className="w-8 h-8 text-accent" />}
                        title="Vibe Search"
                        desc="Search by feeling. 'Cozy cafe with cats' works better than keywords."
                        delay={0.6}
                        onClick={() => handleFeatureClick('vibe-search')}
                    />
                </div>

                <div className="mt-20 text-center">
                    <Link to="/planner" className="btn-primary text-lg px-8 py-3">Explore Now</Link>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, delay, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        onClick={onClick}
        className="p-8 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer text-center group"
    >
        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-50 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-gray-500 leading-relaxed">{desc}</p>
    </motion.div>
);

export default Home;
