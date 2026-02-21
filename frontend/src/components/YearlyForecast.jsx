import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label, selectedYear, data }) => {
    if (active && payload && payload.length) {
        const pointData = payload[0].payload;
        return (
            <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-xl shadow-xl backdrop-blur-md">
                <p className="font-bold text-white mb-2">{label} {selectedYear || data[0]?.year}</p>
                <div className="space-y-1 text-sm">
                    <p className="text-orange-300">Temp: {pointData.temperature}°C</p>
                    <p className="text-blue-300">Humidity: {pointData.humidity}%</p>
                    <p className="text-cyan-300">Rainfall: {pointData.rainfall}mm</p>
                    <div className="mt-2 pt-2 border-t border-slate-600">
                        <span className={`font-bold ${pointData.riskLevel === 'High' ? 'text-red-400' :
                            pointData.riskLevel === 'Moderate' ? 'text-yellow-400' :
                                'text-green-400'
                            }`}>
                            Risk: {pointData.riskLevel}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const YearlyForecast = ({ data, selectedYear, onYearChange, selectedCity, onCityChange }) => {
    if (!data || data.length === 0) return null;

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 2 + i);
    const cities = ["Delhi", "Mumbai", "Chennai", "Kolkata", "Bangalore", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"];

    // Format data for the chart mapping risk levels to numeric values for AreaChart visualization
    const chartData = data.map(item => {
        let riskScore = 1;
        if (item.risk_level === 'Moderate') riskScore = 2;
        if (item.risk_level === 'High') riskScore = 3;

        return {
            month: item.month,
            temperature: item.temperature,
            humidity: item.humidity,
            rainfall: item.rainfall,
            riskLevel: item.risk_level,
            riskScore: riskScore,
            color: item.risk_color
        };
    });



    return (
        <div className="glass-panel p-6 lg:p-8 animate-fade-in mt-8 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Yearly Risk Trend</h2>
                        <p className="text-sm text-slate-400">
                            {selectedCity && <span className="text-indigo-400 font-medium">{selectedCity}</span>}
                            {selectedCity && selectedYear ? ' · ' : ''}
                            {selectedYear && <span className="text-purple-400 font-medium">{selectedYear}</span>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onCityChange && (
                        <select
                            value={selectedCity}
                            onChange={(e) => onCityChange(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                        >
                            {cities.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    )}
                    {onYearChange && (
                        <select
                            value={selectedYear}
                            onChange={(e) => onYearChange(Number(e.target.value))}
                            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer w-28"
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#64748b"
                            tickFormatter={(value) => {
                                if (value === 1) return 'Low';
                                if (value === 2) return 'Mod';
                                if (value === 3) return 'High';
                                return '';
                            }}
                            ticks={[1, 2, 3]}
                            domain={[0, 3.5]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8' }}
                        />
                        <Tooltip content={<CustomTooltip selectedYear={selectedYear} data={data} />} />
                        <Area
                            type="monotone"
                            dataKey="riskScore"
                            stroke="#818cf8"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRisk)"
                            activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Mini Legend Grid underneath chart */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2 mt-6">
                {data.map((month, idx) => (
                    <div
                        key={idx}
                        className={`p-2 rounded-lg text-center border text-xs font-semibold
                ${month.risk_level === 'High' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                month.risk_level === 'Moderate' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                    'bg-green-500/10 border-green-500/30 text-green-400'
                            }`}
                    >
                        <div className="mb-1 text-[10px] text-slate-400 font-normal">{month.month}</div>
                        {month.risk_level.substring(0, 3)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default YearlyForecast;
