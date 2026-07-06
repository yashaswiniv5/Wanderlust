import React from 'react';
import { Star, MapPin, DollarSign } from 'lucide-react';

const DestinationCard = ({ destination }) => {
    const { name, city, type, rating, priceTier, description, isHiddenGem, imageUrl } = destination;

    return (
        <div className="glass-card overflow-hidden group h-full flex flex-col relative transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-900/10">
            <div className="relative h-56 overflow-hidden">
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center text-teal-800/20 font-black text-6xl">
                        {name[0]}
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold text-xl leading-tight text-shadow-sm">{name}</h3>
                    <div className="flex items-center text-white/90 text-sm mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {city}
                    </div>
                </div>

                {isHiddenGem && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-teal-800 text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> HIDDEN GEM
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-1 rounded-md">{type}</span>
                    <div className="flex items-center gap-1 text-slate-700 font-bold text-sm">
                        <Star className="w-3 h-3 fill-slate-700" /> {rating}
                    </div>
                </div>

                <p className="text-slate-500 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed font-light">{description}</p>

                <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-4 border-t border-slate-100/50">
                    <span className="font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">{priceTier}</span>
                    <span className="group-hover:text-teal-600 transition-colors">Explore &rarr;</span>
                </div>
            </div>
        </div>
    );
};

export default DestinationCard;
