import { useState, useEffect } from 'react';
import axios from 'axios';
import SummaryCards from './SummaryCards';
import PredictionForm from './PredictionForm';
import YearlyForecast from './YearlyForecast';
import HistoricalData from './HistoricalData';
import LocationModal from './LocationModal';
import { MapPin } from 'lucide-react';

const Dashboard = () => {
    const [currentData, setCurrentData] = useState(null);
    const [currentPrediction, setCurrentPrediction] = useState(null);
    const [isLiveWeather, setIsLiveWeather] = useState(false);
    const [yearlyForecasts, setYearlyForecasts] = useState([]);
    const [selectedYear, setSelectedYear] = useState(2026);
    const [selectedYearCity, setSelectedYearCity] = useState('Delhi');

    const [userCity, setUserCity] = useState(localStorage.getItem('userCity') || '');
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(!localStorage.getItem('userCity'));

    // Fetch LIVE weather when user city changes
    useEffect(() => {
        const fetchCityData = async () => {
            if (!userCity) return;

            try {
                const liveRes = await axios.get(`http://localhost:8000/api/live-weather?city=${userCity}`);
                const d = liveRes.data;

                setCurrentPrediction({
                    risk_level: d.risk_level,
                    confidence: d.confidence,
                    color: d.color
                });
                setIsLiveWeather(d.is_live);
                setCurrentData({
                    temperature: d.temperature,
                    humidity: d.humidity,
                    rainfall: d.rainfall,
                    description: d.description,
                    city: d.city || userCity,
                    month: d.month
                });
            } catch (error) {
                console.error("Error fetching live weather:", error);
            }
        };

        fetchCityData();
    }, [userCity]);

    // Fetch yearly forecast when year or city changes
    useEffect(() => {
        const fetchYearlyData = async () => {
            try {
                const yearlyRes = await axios.get(`http://localhost:8000/api/yearly-forecast?year=${selectedYear}&city=${selectedYearCity}`);
                setYearlyForecasts(yearlyRes.data.forecast);
            } catch (error) {
                console.error("Error fetching yearly data:", error);
            }
        };

        fetchYearlyData();
    }, [selectedYear, selectedYearCity]);

    const handleSaveLocation = (city) => {
        setUserCity(city);
        localStorage.setItem('userCity', city);
    };


    return (
        <div className="pb-12 text-slate-100">
            <header className="mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">Dengue Risk Dashboard</h1>
                    <p className="text-slate-400">Monitor environmental factors and predict outbreak risks in real-time.</p>
                </div>
                {userCity && (
                    <button
                        onClick={() => setIsLocationModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl transition-colors text-sm font-medium text-slate-300"
                    >
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        {userCity} (Change)
                    </button>
                )}
            </header>

            <SummaryCards currentData={currentData} prediction={currentPrediction} isLive={isLiveWeather} />

            <PredictionForm />

            <YearlyForecast data={yearlyForecasts} selectedYear={selectedYear} onYearChange={setSelectedYear} selectedCity={selectedYearCity} onCityChange={setSelectedYearCity} />

            <HistoricalData />

            <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => userCity ? setIsLocationModalOpen(false) : null}
                onSave={handleSaveLocation}
            />
        </div>
    );
};

export default Dashboard;
