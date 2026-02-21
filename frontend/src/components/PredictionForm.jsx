import { useState } from 'react';
import { Activity, AlertOctagon, TrendingUp, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const PredictionForm = ({ onPredictionUpdate }) => {
    const [formData, setFormData] = useState({
        city: 'Delhi',
        month: new Date().getMonth() + 1,
    });

    const cities = ["Delhi", "Mumbai", "Chennai", "Kolkata", "Bangalore", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"];
    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' },
        { value: 3, label: 'March' }, { value: 4, label: 'April' },
        { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' },
        { value: 9, label: 'September' }, { value: 10, label: 'October' },
        { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];

    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'month' ? Number(value) : value });
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/predict-city', formData);
            setPrediction(response.data);
            if (onPredictionUpdate) {
                onPredictionUpdate(response.data, formData);
            }
        } catch (error) {
            console.error("Error predicting:", error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskIcon = (level) => {
        if (level === 'High') return <AlertOctagon className="w-12 h-12 text-red-500 animate-pulse" />;
        if (level === 'Moderate') return <TrendingUp className="w-12 h-12 text-yellow-500" />;
        return <ShieldCheck className="w-12 h-12 text-green-500" />;
    };

    const getColors = (colorStr) => {
        if (colorStr === 'red') return 'from-red-500/20 to-red-900/40 border-red-500/50 text-red-400';
        if (colorStr === 'yellow') return 'from-yellow-500/20 to-yellow-900/40 border-yellow-500/50 text-yellow-400';
        if (colorStr === 'green') return 'from-green-500/20 to-green-900/40 border-green-500/50 text-green-400';
        return 'from-slate-800 to-slate-900 border-slate-700 text-slate-400';
    };

    return (
        <div className="glass-panel p-6 lg:p-8 animate-fade-in flex flex-col md:flex-row gap-8">
            {/* Form Section */}
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Activity className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                        Dengue Risk Predictor
                    </h2>
                </div>

                <form onSubmit={handlePredict} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Select City</label>
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                                required
                            >
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Select Month</label>
                            <select
                                name="month"
                                value={formData.month}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
                                required
                            >
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex justify-center"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Analyze Risk Factors'
                        )}
                    </button>
                </form>
            </div>

            {/* Result Section */}
            <div className="md:w-64 flex flex-col justify-center">
                {prediction ? (
                    <div className={`p-6 rounded-2xl border bg-gradient-to-br flex flex-col items-center justify-center text-center h-full animate-scale-in ${getColors(prediction.color)}`}>
                        {getRiskIcon(prediction.risk_level)}
                        <h3 className="text-2xl font-bold mt-4 mb-1">{prediction.risk_level} Risk</h3>
                        <p className="text-sm opacity-80 mb-3">Confidence: {prediction.confidence}%</p>

                        <div className="flex gap-4 text-xs opacity-80 justify-center w-full border-t border-white/10 pt-4 mt-2">
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-lg">🌡️</span>
                                <span>{prediction.temperature}°C</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-lg">💧</span>
                                <span>{prediction.humidity}%</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-lg">🌧️</span>
                                <span>{prediction.rainfall}mm</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full min-h-[200px] border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500">
                        <Activity className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm text-center px-4">Awaiting parameters to generate ML prediction</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PredictionForm;
