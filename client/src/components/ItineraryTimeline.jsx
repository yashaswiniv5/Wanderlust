import React from 'react';
import { Clock, MapPin, Star } from 'lucide-react';

// Hardcoded reviews for demo purposes, since we don't fetch them live
// In a real app, these would come from the backend linked to the Destination
const getMockReview = (placeName) => {
    // Return a random-looking but static review based on name length to be consistent
    const ratings = [4.5, 4.7, 4.8, 4.6, 4.9];
    const rating = ratings[placeName.length % ratings.length];

    // Some mock review counts
    const reviewCounts = [1240, 856, 3421, 2100, 567];
    const reviews = reviewCounts[placeName.length % reviewCounts.length];

    return { rating, reviews };
};

const ItineraryTimeline = ({ itinerary }) => {
    if (!itinerary || !itinerary.days) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
            <h2 className="text-3xl font-bold mb-2 text-primary">Your Trip Plan</h2>
            <p className="text-gray-500 mb-8 italic">{itinerary.summary}</p>

            <div className="space-y-10">
                {itinerary.days.map((day, idx) => (
                    <div key={idx} className="relative pl-8 md:pl-0">
                        {/* Day Header */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                            <div className="bg-accent text-white font-bold text-xl px-4 py-2 rounded-lg shadow-md w-fit">
                                Day {day.day}
                            </div>
                            <div className="h-px bg-gray-200 flex-grow hidden md:block"></div>
                        </div>

                        {/* Activities Grid */}
                        <div className="grid gap-6">
                            {day.plan.map((item, i) => {
                                const { rating, reviews } = getMockReview(item.place);
                                return (
                                    <div key={i} className="flex gap-4 relative">
                                        {/* Timeline Connector */}
                                        <div className="absolute left-[-29px] md:hidden top-2 bottom-[-24px] w-px bg-gray-200"></div>
                                        <div className="absolute left-[-33px] md:hidden top-2 w-3 h-3 rounded-full bg-primary border-2 border-white shadow"></div>

                                        <div className="flex-shrink-0 w-24 text-right pt-1 hidden md:block">
                                            <span className="font-bold text-gray-400 text-sm tracking-wide uppercase">{item.time}</span>
                                        </div>

                                        <div className="flex-grow bg-gray-50 hover:bg-white border border-gray-100 hover:border-teal-200 p-4 rounded-xl transition-all hover:shadow-md group">
                                            <div className="md:hidden text-xs font-bold text-gray-400 uppercase mb-1">{item.time}</div>

                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2 group-hover:text-primary transition-colors">
                                                    <MapPin className="w-4 h-4 text-accent" />
                                                    {item.place}
                                                </h4>

                                                {/* Google Review Badge Style */}
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded shadow-sm">
                                                        <span className="text-orange-500 font-bold text-sm">{rating}</span>
                                                        <div className="flex">
                                                            {[...Array(5)].map((_, starI) => (
                                                                <Star
                                                                    key={starI}
                                                                    size={10}
                                                                    className={`${starI < Math.floor(rating) ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-3 h-3 ml-1" />
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 mt-0.5">({reviews.toLocaleString()} reviews)</span>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 mt-2 text-sm leading-relaxed">{item.note}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ItineraryTimeline;
