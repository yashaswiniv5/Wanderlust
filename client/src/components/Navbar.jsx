import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Map, Heart, Sparkles } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200">
            <div className="container mx-auto px-4 h-16 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-blue-900">
                    <Compass className="w-8 h-8 text-blue-600" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-blue-600">WanderLust</span>
                </Link>

                <div className="flex items-center gap-1 font-semibold text-gray-700 text-sm">
                    <Link to="/" className="hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-full transition-all">Home</Link>
                    <Link to="/explorer" className="hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-full transition-all flex items-center gap-1">
                        <Map className="w-4 h-4" /> Explorer
                    </Link>
                    <Link to="/maps" className="hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-full transition-all flex items-center gap-1">
                        <Map className="w-4 h-4" /> Maps
                    </Link>
                    <Link to="/saved" className="hover:bg-blue-50 hover:text-blue-600 px-4 py-2 rounded-full transition-all flex items-center gap-1">
                        <Heart className="w-4 h-4" /> Saved
                    </Link>
                    <Link to="/planner" className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:-translate-y-0.5 px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-blue-500/30">
                        <Sparkles className="w-4 h-4" /> Plan Trip
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
