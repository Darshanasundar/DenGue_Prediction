import { useState } from 'react';
import { useTheme } from '../ThemeContext';

const LocationModal = ({ isOpen, onClose, onSave }) => {
    const { isDark } = useTheme();
    const [city, setCity] = useState('Delhi');
    const cities = [
        "Agra","Ahmedabad","Amritsar","Bangalore","Bhopal","Bhubaneswar","Chandigarh","Chennai",
        "Dehradun","Delhi","Erode","Faridabad","Ghaziabad","Guwahati","Hyderabad","Indore","Jaipur","Kanpur",
        "Kochi","Kolkata","Lucknow","Ludhiana","Meerut","Mumbai","Nagpur","Nashik","Patna","Pune",
        "Rajkot","Shimla","Srinagar","Surat","Thane","Thiruvananthapuram","Vadodara","Varanasi","Visakhapatnam"
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className={`p-6 rounded-xl w-[90%] max-w-xs shadow-xl border
                ${isDark ? 'bg-[#1c1c1a] border-stone-800' : 'bg-white border-stone-200'}`}>
                <p className={`text-lg font-bold mb-1 ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>Select your city</p>
                <p className={`text-xs mb-5 ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>For real-time weather & risk data</p>

                <form onSubmit={(e) => { e.preventDefault(); onSave(city); onClose(); }} className="space-y-4">
                    <select value={city} onChange={e => setCity(e.target.value)} className="select-styled w-full py-2.5">
                        {cities.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <button type="submit" className="btn-primary w-full">Continue</button>
                    {onClose && (
                        <button type="button" onClick={onClose}
                            className={`w-full text-xs py-2 ${isDark ? 'text-stone-600 hover:text-stone-400' : 'text-stone-400 hover:text-stone-600'}`}>
                            Cancel
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default LocationModal;
