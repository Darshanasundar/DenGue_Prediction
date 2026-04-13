import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import axios from 'axios';

const PredictionForm = () => {
    const { isDark } = useTheme();
    const [city, setCity] = useState('Delhi');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const cities = [
        "Agra","Ahmedabad","Amritsar","Bangalore","Bhopal","Bhubaneswar","Chandigarh","Chennai",
        "Dehradun","Delhi","Erode","Faridabad","Ghaziabad","Guwahati","Hyderabad","Indore","Jaipur","Kanpur",
        "Kochi","Kolkata","Lucknow","Ludhiana","Meerut","Mumbai","Nagpur","Nashik","Patna","Pune",
        "Rajkot","Shimla","Srinagar","Surat","Thane","Thiruvananthapuram","Vadodara","Varanasi","Visakhapatnam"
    ];
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/api/predict-city', { city, month });
            setResult(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const riskColor = result?.color === 'red' ? 'text-red-500' : result?.color === 'yellow' ? 'text-amber-500' : 'text-teal-500';

    return (
        <div className="card p-5 h-full">
            <p className="section-title mb-4" style={{ color: isDark ? '#e7e5e4' : '#1c1917' }}>Predict Risk</p>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="label block mb-1">City</label>
                    <select value={city} onChange={e => setCity(e.target.value)} className="select-styled w-full">
                        {cities.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="label block mb-1">Month</label>
                    <select value={month} onChange={e => setMonth(Number(e.target.value))} className="select-styled w-full">
                        {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? 'Analyzing...' : 'Run Prediction'}
                </button>
            </form>

            {result && (
                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-stone-800' : 'border-stone-200'}`}>
                    <div className="flex items-baseline justify-between">
                        <p className={`text-3xl font-bold ${riskColor}`}>{result.risk_level}</p>
                        <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{result.confidence}%</p>
                    </div>
                    <div className={`flex gap-4 mt-2 text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                        <span>{result.temperature}°C</span>
                        <span>{result.humidity}%</span>
                        <span>{result.rainfall}mm</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PredictionForm;
