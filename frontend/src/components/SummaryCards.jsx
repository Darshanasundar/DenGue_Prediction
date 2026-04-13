import { useTheme } from '../ThemeContext';

const SummaryCards = ({ data, prediction, isLive }) => {
    const { isDark } = useTheme();

    const metrics = [
        { label: 'Temperature', value: data?.temperature, unit: '°C', dot: 'bg-orange-400' },
        { label: 'Humidity', value: data?.humidity, unit: '%', dot: 'bg-blue-400' },
        { label: 'Rainfall', value: data?.rainfall, unit: 'mm', dot: 'bg-sky-400' },
    ];

    const riskColor = prediction?.color === 'red' ? 'text-red-500' : prediction?.color === 'yellow' ? 'text-amber-500' : 'text-teal-500';
    const riskBg = prediction?.color === 'red' ? (isDark ? 'bg-red-900/20 border-red-900/30' : 'bg-red-50 border-red-100')
        : prediction?.color === 'yellow' ? (isDark ? 'bg-amber-900/20 border-amber-900/30' : 'bg-amber-50 border-amber-100')
        : (isDark ? 'bg-teal-900/20 border-teal-900/30' : 'bg-teal-50 border-teal-100');

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            {metrics.map((m, i) => (
                <div key={i} className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-center ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2 h-2 rounded-full ${m.dot}`} />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{m.label}</span>
                    </div>
                    <p className={`text-3xl font-extrabold tabular-nums ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        {m.value != null ? `${m.value}` : '—'}
                        {m.value != null && <span className="text-lg font-semibold ml-1 text-slate-400">{m.unit}</span>}
                    </p>
                </div>
            ))}

            {/* Risk card */}
            <div className={`p-5 rounded-3xl border flex flex-col justify-center ${riskBg}`}>
                <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2 h-2 rounded-full ${prediction?.color === 'red' ? 'bg-red-500 animate-pulse' : prediction?.color === 'yellow' ? 'bg-amber-500' : 'bg-teal-500'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Risk Level</span>
                    {isLive && <span className={`ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm ${isDark ? 'bg-teal-900/40 text-teal-400' : 'bg-teal-100 text-teal-700'}`}>LIVE</span>}
                </div>
                <p className={`text-3xl font-extrabold ${riskColor}`}>
                    {prediction?.risk_level || '—'}
                </p>
                {prediction?.confidence && (
                    <p className={`text-xs mt-1 font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{prediction.confidence}% confidence</p>
                )}
            </div>
        </div>
    );
};

export default SummaryCards;
