import { useState } from 'react';
import { MapPin, CheckCircle2 } from 'lucide-react';

const LocationModal = ({ isOpen, onClose, onSave }) => {
    const [selectedCity, setSelectedCity] = useState('Delhi');
    const cities = ["Delhi", "Mumbai", "Chennai", "Kolkata", "Bangalore", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"];

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(selectedCity);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-700/50 p-6 md:p-8 rounded-2xl w-[90%] max-w-md shadow-2xl animate-scale-in">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-500/20 rounded-xl">
                        <MapPin className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Select Location</h2>
                        <p className="text-slate-400 text-sm">To provide real-time risk analysis</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">My Current City</label>
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                        >
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 flex justify-center items-center gap-2"
                    >
                        Save Location <CheckCircle2 className="w-5 h-5" />
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-slate-500 hover:text-white text-sm transition-colors mt-2"
                        >
                            Cancel
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default LocationModal;
