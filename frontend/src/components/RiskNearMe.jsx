import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';

const RiskNearMe = ({ onLocationDetected }) => {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDetectLocation = () => {
        setLoading(true);
        setError(null);
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        // Explicit interaction - triggers browser permission prompt, not on page load
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                setLoading(false);
                if (onLocationDetected) {
                    onLocationDetected(coords); // Pass upwards to recalculate dashboard state
                }
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
    };

    return (
        <div className={`card p-4 flex flex-col items-center justify-center space-y-3 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'} rounded-xl shadow-sm border`}>
            <div className="flex items-center gap-3 w-full">
                <div className={`p-3 rounded-full ${isDark ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className={`font-semibold text-sm ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>Live Location Intelligence</h3>
                    <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Scan surroundings for high-risk zones & nearest medical centers</p>
                </div>
            </div>

            <button 
                onClick={handleDetectLocation} 
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white p-2.5 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2"
            >
                {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Scan Risk Near Me
                    </>
                )}
            </button>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
    );
};

export default RiskNearMe;
