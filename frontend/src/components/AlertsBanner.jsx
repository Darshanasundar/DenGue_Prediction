import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../ThemeContext';

const AlertsBanner = () => {
    const { isDark } = useTheme();
    const [alerts, setAlerts] = useState([]);
    const [show, setShow] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:8000/api/city-risk-map')
            .then(({ data }) => setAlerts(data.cities.filter(c => c.risk_level === 'High')))
            .catch(console.error);
    }, []);

    if (!show || alerts.length === 0) return null;

    return (
        <div className={`mb-5 flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm
            ${isDark ? 'bg-red-950/15 border-red-900/20 text-red-400' : 'bg-red-50 border-red-100 text-red-700'}`}>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <p className="flex-1 text-xs">
                <span className="font-semibold">{alerts.length} cities</span> at high risk —{' '}
                {alerts.slice(0, 5).map(a => a.city).join(', ')}
                {alerts.length > 5 && ` +${alerts.length - 5} more`}
            </p>
            <button onClick={() => setShow(false)} className={`text-xs font-medium opacity-50 hover:opacity-100 transition`}>✕</button>
        </div>
    );
};

export default AlertsBanner;
