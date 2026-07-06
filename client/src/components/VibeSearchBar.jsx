import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VibeSearchBar = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/explorer?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="w-6 h-6 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Where do you want to go? (e.g. 'Kyoto', 'Peaceful temples')"
                    className="w-full h-16 pl-14 pr-32 rounded-lg border border-gray-300 bg-gray-50 text-xl font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
                <div className="absolute right-2 top-2 bottom-2">
                    <button
                        type="submit"
                        className="h-full px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all uppercase tracking-wide"
                    >
                        Search
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VibeSearchBar;
