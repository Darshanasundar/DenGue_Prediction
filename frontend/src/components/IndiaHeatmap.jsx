import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../ThemeContext';

const REGIONS = {
    "North": ["Delhi","Faridabad","Ghaziabad","Meerut","Chandigarh","Amritsar","Ludhiana","Shimla","Dehradun","Srinagar","Jaipur"],
    "Central": ["Lucknow","Kanpur","Varanasi","Agra","Patna","Bhopal","Indore","Nagpur"],
    "West": ["Mumbai","Thane","Pune","Nashik","Ahmedabad","Surat","Vadodara","Rajkot"],
    "South": ["Chennai","Bangalore","Hyderabad","Kochi","Thiruvananthapuram","Erode","Visakhapatnam"],
    "East": ["Kolkata","Bhubaneswar","Guwahati"],
};

const IndiaHeatmap = () => {
    const { isDark } = useTheme();
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [month, setMonth] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8000/api/city-risk-map')
            .then(({ data }) => { setCities(data.cities); setMonth(data.month); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const monthNames = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const getCityInfo = (name) => cities.find(c => c.city === name);
    const counts = { High: 0, Moderate: 0, Low: 0 };
    cities.forEach(c => counts[c.risk_level]++);

    const riskDot = (l) => l === 'High' ? 'bg-red-500' : l === 'Moderate' ? 'bg-amber-500' : 'bg-teal-500';
    const riskText = (l) => l === 'High' ? 'text-red-500' : l === 'Moderate' ? 'text-amber-500' : 'text-teal-500';
    const riskBg = (l) => l === 'High' ? (isDark ? 'bg-red-950/15 border-red-900/20' : 'bg-red-50 border-red-100') : l === 'Moderate' ? (isDark ? 'bg-amber-950/15 border-amber-900/20' : 'bg-amber-50 border-amber-100') : (isDark ? 'bg-teal-950/15 border-teal-900/20' : 'bg-teal-50 border-teal-100');

    return (
        <div className="pb-12">
            <div className="flex items-end justify-between mb-6">
                <div>
                    <p className="label mb-1">Risk Map</p>
                    <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>India · {month ? monthNames[month] : ''} 2026</h1>
                </div>
                <div className="flex gap-4">
                    {['High','Moderate','Low'].map(l => (
                        <div key={l} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${riskDot(l)} ${l === 'High' ? 'animate-pulse' : ''}`} />
                            <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{counts[l]} {l}</span>
                        </div>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-5 h-5 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-5">
                    <div className="flex-1 space-y-4">
                        {Object.entries(REGIONS).map(([region, cityList]) => (
                            <div key={region} className="card p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className={`text-xs font-semibold ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{region} India</p>
                                    <p className={`text-[10px] ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>{cityList.length} cities</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                                    {cityList.map(name => {
                                        const c = getCityInfo(name);
                                        if (!c) return null;
                                        const isSelected = selected?.city === name;
                                        return (
                                            <button key={name} onClick={() => setSelected(isSelected ? null : c)}
                                                className={`text-left px-3 py-2 rounded-lg border text-[13px] transition-all
                                                    ${riskBg(c.risk_level)}
                                                    ${isSelected ? 'ring-2 ring-teal-500 ring-offset-1' : ''}
                                                    ${isDark ? 'ring-offset-[#111110]' : 'ring-offset-white'}`}>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${riskDot(c.risk_level)} ${c.risk_level === 'High' ? 'animate-pulse' : ''}`} />
                                                    <span className={`font-medium ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>{name}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detail panel */}
                    <div className="lg:w-64 lg:sticky lg:top-6 lg:self-start">
                        {selected ? (
                            <div className="card p-5 space-y-4">
                                <div>
                                    <p className={`text-lg font-bold ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>{selected.city}</p>
                                    <p className={`text-xs ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>{selected.state}</p>
                                </div>
                                <p className={`text-3xl font-bold ${riskText(selected.risk_level)}`}>{selected.risk_level}</p>
                                <div className={`text-xs space-y-2 pt-3 border-t ${isDark ? 'border-stone-800 text-stone-400' : 'border-stone-200 text-stone-500'}`}>
                                    <div className="flex justify-between"><span>Temperature</span><span className={`font-semibold ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>{selected.temperature}°C</span></div>
                                    <div className="flex justify-between"><span>Humidity</span><span className={`font-semibold ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>{selected.humidity}%</span></div>
                                    <div className="flex justify-between"><span>Rainfall</span><span className={`font-semibold ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>{selected.rainfall}mm</span></div>
                                    <div className="flex justify-between"><span>Confidence</span><span className={`font-semibold ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>{selected.confidence}%</span></div>
                                </div>
                            </div>
                        ) : (
                            <div className={`card p-5 text-center ${isDark ? 'text-stone-600' : 'text-stone-400'}`}>
                                <p className="text-sm">Select a city to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IndiaHeatmap;
