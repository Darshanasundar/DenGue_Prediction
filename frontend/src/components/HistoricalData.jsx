import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

const HistoricalData = () => {
    const [data, setData] = useState([]);
    const [selectedState, setSelectedState] = useState('All');
    const [loading, setLoading] = useState(true);

    const states = [
        "All", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
        "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
        "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
        "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
    ];

    useEffect(() => {
        const fetchHistoricalData = async () => {
            setLoading(true);
            try {
                const url = selectedState === 'All'
                    ? 'http://localhost:8000/api/historical-cases'
                    : `http://localhost:8000/api/historical-cases?state=${selectedState}`;
                const response = await axios.get(url);
                setData(response.data.historical_data);
            } catch (error) {
                console.error("Error fetching historical data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoricalData();
    }, [selectedState]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl shadow-xl backdrop-blur-md">
                    <p className="font-bold text-white mb-2">{label}</p>
                    <p className="text-indigo-400">Cases: {payload[0].value.toLocaleString()}</p>
                    {payload[1] && <p className="text-red-400">Deaths: {payload[1].value.toLocaleString()}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass-panel p-6 lg:p-8 animate-fade-in mt-8 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Activity className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Historical Dengue Cases (India)</h2>
                        <p className="text-sm text-slate-400">Source: Kaggle Dataset (2019 - 2024)</p>
                    </div>
                </div>

                <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer sm:w-64"
                >
                    {states.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="h-[350px] w-full mt-4">
                {loading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
                        <p>Loading historical records...</p>
                    </div>
                ) : data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="year" stroke="#94a3b8" axisLine={false} tickLine={false} />
                            <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="cases" name="Total Cases" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={60} />
                            <Bar dataKey="deaths" name="Total Deaths" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
                        <Activity className="w-12 h-12 mb-3 opacity-20" />
                        <p>No data available for this selection.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoricalData;
