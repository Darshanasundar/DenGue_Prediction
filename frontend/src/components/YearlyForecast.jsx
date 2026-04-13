import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../ThemeContext';

const YearlyForecast = ({ data, year, onYearChange, city, onCityChange }) => {
    const { isDark } = useTheme();

    // Always render the card — show skeleton when no data to prevent grid collapse
    if (!data || data.length === 0) {
        return (
            <div className="card p-5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <p className="section-title" style={{ color: isDark ? '#e7e5e4' : '#1c1917' }}>Yearly Trend</p>
                </div>
                <div className="flex-1 min-h-[200px] flex flex-col items-center justify-center gap-3">
                    <div className={`w-8 h-8 border-[3px] rounded-full animate-spin ${isDark ? 'border-slate-700 border-t-teal-500' : 'border-slate-200 border-t-teal-500'}`} />
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Loading forecast data…</p>
                    <p className={`text-xs text-center max-w-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Start the backend server to see yearly predictions</p>
                </div>
            </div>
        );
    }

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);
    const cities = [
        "Agra","Ahmedabad","Amritsar","Bangalore","Bhopal","Bhubaneswar","Chandigarh","Chennai",
        "Dehradun","Delhi","Erode","Faridabad","Ghaziabad","Guwahati","Hyderabad","Indore","Jaipur","Kanpur",
        "Kochi","Kolkata","Lucknow","Ludhiana","Meerut","Mumbai","Nagpur","Nashik","Patna","Pune",
        "Rajkot","Shimla","Srinagar","Surat","Thane","Thiruvananthapuram","Vadodara","Varanasi","Visakhapatnam"
    ];

    const chartData = data.map(d => ({
        month: d.month?.substring(0, 3),
        risk: d.risk_level === 'High' ? 3 : d.risk_level === 'Moderate' ? 2 : 1,
        level: d.risk_level,
        temp: d.temperature,
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload?.length) {
            const d = payload[0].payload;
            return (
                <div className={`text-xs p-2 rounded-lg border shadow-md ${isDark ? 'bg-stone-800 border-stone-700 text-stone-200' : 'bg-white border-stone-200 text-stone-700'}`}>
                    <p className="font-bold">{d.month} — <span className={d.level === 'High' ? 'text-red-500' : d.level === 'Moderate' ? 'text-amber-500' : 'text-teal-500'}>{d.level}</span></p>
                    <p>{d.temp}°C</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <p className="section-title" style={{ color: isDark ? '#e7e5e4' : '#1c1917' }}>Yearly Trend</p>
                <div className="flex gap-1.5">
                    <select value={city} onChange={e => onCityChange(e.target.value)} className="select-styled text-xs py-1 px-2">
                        {cities.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select value={year} onChange={e => onYearChange(Number(e.target.value))} className="select-styled text-xs py-1 px-2 w-16">
                        {years.map(y => <option key={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                        <defs>
                            <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fill: isDark ? '#57534e' : '#a8a29e', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={v => ['','Low','Mod','High'][v] || ''} ticks={[1,2,3]} domain={[0,3.5]}
                            tick={{ fill: isDark ? '#57534e' : '#a8a29e', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="risk" stroke="#0d9488" strokeWidth={2} fill="url(#rg)"
                            activeDot={{ r: 4, fill: '#0d9488', stroke: isDark ? '#1c1c1a' : '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default YearlyForecast;
