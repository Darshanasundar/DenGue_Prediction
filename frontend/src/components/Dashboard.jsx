import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import SummaryCards from './SummaryCards';
import PredictionForm from './PredictionForm';
import YearlyForecast from './YearlyForecast';
import PreventionChecklist from './PreventionChecklist';
import AlertsBanner from './AlertsBanner';
import OperationalPlan from './OperationalPlan';
import ModelExplainer from './ModelExplainer';
import { Navigation2, Loader2, RefreshCw, MapPin } from 'lucide-react';

const CITIES = [
    "Agra","Ahmedabad","Amritsar","Bangalore","Bhopal","Bhubaneswar","Chandigarh","Chennai",
    "Dehradun","Delhi","Erode","Faridabad","Ghaziabad","Guwahati","Hyderabad","Indore","Jaipur","Kanpur",
    "Kochi","Kolkata","Lucknow","Ludhiana","Meerut","Mumbai","Nagpur","Nashik","Patna","Pune",
    "Rajkot","Shimla","Srinagar","Surat","Thane","Thiruvananthapuram","Vadodara","Varanasi","Visakhapatnam"
];

const matchCity = (detected) => {
    if (!detected) return 'Delhi';
    const lower = detected.toLowerCase();
    const direct = CITIES.find(c => c.toLowerCase() === lower);
    if (direct) return direct;
    const partial = CITIES.find(c => lower.includes(c.toLowerCase()) || c.toLowerCase().includes(lower.split(' ')[0]));
    if (partial) return partial;
    return 'Delhi';
};

const RISK_BADGE = {
    High:     'bg-red-500 text-white',
    Moderate: 'bg-amber-500 text-white',
    Low:      'bg-emerald-500 text-white',
};

const Dashboard = () => {
    const { isDark } = useTheme();
    const [currentData, setCurrentData] = useState(null);
    const [currentPrediction, setCurrentPrediction] = useState(null);
    const [isLiveWeather, setIsLiveWeather] = useState(false);
    const [yearlyForecasts, setYearlyForecasts] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedYearCity, setSelectedYearCity] = useState('Delhi');
    const [userCity, setUserCity] = useState('');
    const [userCoords, setUserCoords] = useState(null);
    const [locationStatus, setLocationStatus] = useState('idle');

    const detectLocation = () => {
        setLocationStatus('loading');
        if (!navigator.geolocation) {
            setLocationStatus('denied');
            setUserCity('Delhi');
            setUserCoords({ lat: 28.61, lon: 77.21 });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                        { headers: { 'Accept-Language': 'en', 'User-Agent': 'DengueAI-Research-App/1.0' } }
                    );
                    const data = await res.json();
                    const raw = data.address?.city || data.address?.town || data.address?.county || data.address?.state || "Unknown";
                    setUserCity(raw);
                    setUserCoords({ lat: latitude, lon: longitude });
                    setLocationStatus('success');
                } catch {
                    setUserCity('Delhi');
                    setUserCoords({ lat: 28.61, lon: 77.21 });
                    setLocationStatus('success');
                }
            },
            () => {
                setLocationStatus('denied');
                setUserCity('Delhi');
                setUserCoords({ lat: 28.61, lon: 77.21 });
            },
            { timeout: 10000 }
        );
    };

    useEffect(() => {
        // ALWAYS detect location on reload.
        detectLocation();
    }, []);

    useEffect(() => {
        if (!userCity) return;
        const apiCall = userCoords 
            ? axios.get(`http://localhost:8000/api/live-location?lat=${userCoords.lat}&lon=${userCoords.lon}`)
            : axios.get(`http://localhost:8000/api/live-weather?city=${userCity}`);
            
        apiCall
            .then(({ data: d }) => {
                setCurrentPrediction({ risk_level: d.risk_level, confidence: d.confidence, color: d.color });
                setIsLiveWeather(d.is_live);
                setCurrentData({ temperature: d.temperature, humidity: d.humidity, rainfall: d.rainfall, description: d.description, city: d.city || userCity, month: d.month, feature_impact: d.feature_impact });
            }).catch(console.error);
    }, [userCity, userCoords]);

    useEffect(() => {
        axios.get(`http://localhost:8000/api/yearly-forecast?year=${selectedYear}&city=${selectedYearCity}`)
            .then(({ data }) => setYearlyForecasts(data.forecast)).catch(console.error);
    }, [selectedYear, selectedYearCity]);

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="pb-12 space-y-5">

            {/* ── Hero Banner ─────────────────────────────────────────────── */}
            <div className="relative rounded-2xl overflow-hidden shadow-md" style={{ minHeight: 180 }}>
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=2600&auto=format&fit=crop"
                        alt="Health lab"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/50" />
                </div>

                <div className="relative h-full flex flex-col justify-between px-8 py-6 z-10">
                    {/* Top row: badge + date LEFT, risk badge RIGHT */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-400 text-[10px] font-bold uppercase tracking-widest border border-sky-500/30">
                                Live Environment Monitor
                            </span>
                            <p className="text-slate-400 text-xs hidden sm:block">{dateStr}</p>
                        </div>

                        {/* Risk level badge — top right */}
                        {currentPrediction ? (
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${RISK_BADGE[currentPrediction.risk_level] || 'bg-teal-500 text-white'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                {currentPrediction.risk_level} Risk
                            </span>
                        ) : (
                            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-slate-400 border border-white/10">
                                Loading…
                            </span>
                        )}
                    </div>

                    {/* Bottom: title + city row */}
                    <div className="mt-5">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                            Dashboard Overview
                        </h1>
                        <p className="text-slate-300 text-sm mt-1.5 max-w-lg">
                            Real-time meteorological tracking merged with AI forecasting to predict and prevent local dengue outbreaks.
                        </p>

                        {/* Nearest city row */}
                        <div className="mt-4 flex items-center gap-2 text-slate-300 text-sm">
                            {locationStatus === 'loading'
                                ? <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                                : <MapPin className="w-4 h-4 text-sky-400" />
                            }
                            <span className="text-slate-400 text-xs">Current tracking region:</span>
                            <span className="font-semibold text-white">
                                {locationStatus === 'loading' ? 'Detecting coordinates…' : userCity || '—'}
                            </span>
                            {userCoords && locationStatus === 'success' && (
                                <span className="ml-2 text-[10px] uppercase font-bold text-sky-500/80 tracking-widest border border-sky-500/20 bg-sky-500/10 px-1.5 py-0.5 rounded">
                                    [Lat: {userCoords.lat.toFixed(2)}, Lon: {userCoords.lon.toFixed(2)}]
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Location Denied Banner ─────────────────────────────────── */}
            {locationStatus === 'denied' && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border
                    ${isDark ? 'bg-amber-950/20 border-amber-900/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                    <Navigation2 className="w-4 h-4 flex-shrink-0" />
                    <p className="flex-1 text-xs">
                        Location access was denied. Showing default data for <strong>{userCity}</strong>.{' '}
                        <button onClick={detectLocation} className="underline font-semibold inline-flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Try again
                        </button>.
                    </p>
                </div>
            )}

            <AlertsBanner />

            {/* ── Summary Cards + AI Explainer side-by-side ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                {/* SummaryCards takes 3/4 of the row */}
                <div className="lg:col-span-3">
                    <SummaryCards data={currentData} prediction={currentPrediction} isLive={isLiveWeather} />
                </div>
                {/* ModelExplainer takes 1/4 */}
                <div className="lg:col-span-1">
                    <ModelExplainer featureImportance={currentData?.feature_impact || null} />
                </div>
            </div>

            {/* ── Operational Plan — full width (only renders when High/Moderate) */}
            <OperationalPlan cityPopulation={1200000} riskLevel={currentPrediction?.risk_level} />

            {/* ── Prediction Form + Yearly Trend ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-2">
                    <PredictionForm />
                </div>
                <div className="lg:col-span-3">
                    <YearlyForecast
                        data={yearlyForecasts}
                        year={selectedYear}
                        onYearChange={setSelectedYear}
                        city={selectedYearCity}
                        onCityChange={setSelectedYearCity}
                    />
                </div>
            </div>

            {/* ── Prevention Checklist ───────────────────────────────────────── */}
            <PreventionChecklist riskLevel={currentPrediction?.risk_level} />
        </div>
    );
};

export default Dashboard;
