import React, { useState, useRef } from 'react';
import { Upload, X, Loader, Search, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VibeSearchModal = ({ isOpen, onClose }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageSelect({ target: { files: [file] } });
        }
    };

    const handleSearch = async () => {
        if (!selectedImage) return;

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            // We'll assume the backend returns a search query or directly results
            // For now, let's assume it returns a description/keywords we can use to search
            // Or better, we navigate to explorer with a special ID or query

            // Temporary: Mock behavior until backend is ready or use a specific endpoint
            const res = await axios.post('http://localhost:5000/api/destinations/vibe-search', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Assuming backend returns { vibeDescription: "...", matchedDestinations: [...] }
            // We can navigate to explorer with the vibe description as query
            if (res.data.vibeDescription) {
                onClose();
                navigate(`/explorer?q=${encodeURIComponent(res.data.vibeDescription)}`);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to analyze image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Sparkles className="w-6 h-6 text-purple-600" />
                                        Vibe Search
                                    </h2>
                                    <p className="text-gray-500 text-sm mt-1">Upload an image to find places with a similar vibe.</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${previewUrl ? 'border-purple-200 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                                    }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                    accept="image/*"
                                    className="hidden"
                                />

                                {previewUrl ? (
                                    <div className="relative group">
                                        <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                            <p className="text-white font-medium">Click to change</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-medium text-gray-700">Click or drag image here</p>
                                            <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG (max 5MB)</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm mt-3 text-center bg-red-50 py-2 rounded-lg">{error}</p>
                            )}

                            <div className="mt-8">
                                <button
                                    onClick={handleSearch}
                                    disabled={!selectedImage || loading}
                                    className="w-full btn-primary bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-4 text-lg font-bold shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Analyzing Vibe...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-5 h-5" />
                                            Find Matching Places
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Start of Sparkles icon definition since it was used but not imported in VibeSearchBar
const Sparkles = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
)

export default VibeSearchModal;
