import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    ScatterChart, Scatter, PieChart, Pie, LineChart, Line, Legend,
} from 'recharts';
import { useTheme } from '../ThemeContext';
import { Thermometer, Droplets, CloudRain, Activity } from 'lucide-react';

const RISK_LEVELS = [
    { label: 'Low',      color: '#10b981', textColor: 'text-emerald-600', bg: 'bg-emerald-50',  darkBg: 'bg-emerald-950/30', border: 'border-emerald-200', darkBorder: 'border-emerald-900/40' },
    { label: 'Moderate', color: '#f59e0b', textColor: 'text-amber-600',   bg: 'bg-amber-50',    darkBg: 'bg-amber-950/30',   border: 'border-amber-200',   darkBorder: 'border-amber-900/40'   },
    { label: 'High',     color: '#ef4444', textColor: 'text-red-600',     bg: 'bg-red-50',      darkBg: 'bg-red-950/30',     border: 'border-red-200',     darkBorder: 'border-red-900/40'     },
];

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTip = ({ active, payload, label, isDark }) => {
    if (active && payload?.length) {
        return (
            <div className={`text-xs p-2.5 rounded-xl border shadow-lg ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                {label && <p className="font-bold mb-1">{label}</p>}
                {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong></p>)}
            </div>
        );
    }
    return null;
};

const CorrelationCharts = () => {
    const { isDark } = useTheme();
    const [data, setData]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [scatterFactor, setScatterFactor] = useState('temperature');

    useEffect(() => {
        axios.get('http://localhost:8000/api/correlation-data')
            .then(({ data }) => setData(data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const avg = (risk, key) => {
        const f = data.filter(d => d.risk_level === risk);
        return f.length ? Math.round(f.reduce((s, d) => s + d[key], 0) / f.length) : 0;
    };

    const count = (risk) => data.filter(d => d.risk_level === risk).length;

    const chartData = RISK_LEVELS.map(l => ({
        name: l.label, color: l.color,
        temp:     avg(l.label, 'temperature'),
        humidity: avg(l.label, 'humidity'),
        rainfall: avg(l.label, 'rainfall'),
        cases:    avg(l.label, 'cases'),
    }));

    // Scatter: x = factor value, y = cases, color = risk
    const scatterData = data.filter(d => d[scatterFactor] != null).map(d => ({
        x: d[scatterFactor],
        y: d.cases,
        risk: d.risk_level,
        color: RISK_LEVELS.find(r => r.label === d.risk_level)?.color || '#94a3b8',
    }));

    // Donut / pie data
    const pieData = RISK_LEVELS.map(l => ({
        name:  l.label,
        value: count(l.label),
        color: l.color,
    }));

    // Monthly trend — aggregate by month from raw data
    const monthlyMap = {};
    data.forEach(d => {
        if (!d.month) return;
        const m = parseInt(d.month);
        if (!monthlyMap[m]) monthlyMap[m] = { month: m, humidity: [], cases: [] };
        monthlyMap[m].humidity.push(d.humidity);
        monthlyMap[m].cases.push(d.cases);
    });
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const m = monthlyMap[i + 1];
        if (!m || m.humidity.length === 0) return { name: MONTH_SHORT[i], humidity: null, cases: null };
        return {
            name:     MONTH_SHORT[i],
            humidity: Math.round(m.humidity.reduce((a, b) => a + b, 0) / m.humidity.length),
            cases:    Math.round(m.cases.reduce((a, b) => a + b, 0) / m.cases.length),
        };
    });

    const totalSamples = data.length;

    const axisStyle = { fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 };
    const gridColor  = isDark ? '#1e293b' : '#f1f5f9';

    const MiniBar = ({ dataKey, title, unit }) => (
        <div className={`p-5 rounded-3xl border shadow-sm transition-all hover:shadow-md ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100'}`}>
            <p className={`text-xs font-bold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Avg {title} <span className={`font-normal ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{unit}</span>
            </p>
            <div className="h-[130px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTip isDark={isDark} />} cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }} />
                        <Bar dataKey={dataKey} radius={[5, 5, 0, 0]} maxBarSize={40}>
                            {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <div className="pb-12 space-y-5">

            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="px-8 pt-6 pb-2">
                <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-widest mb-1">Data Insights</p>
                <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Weather &amp; Dengue Analytics
                </h1>
                <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Statistical analysis of {totalSamples || 300} data points across temperature, humidity, rainfall, and case counts.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className={`w-8 h-8 border-[3px] rounded-full animate-spin ${isDark ? 'border-slate-700 border-t-indigo-500' : 'border-slate-200 border-t-indigo-500'}`} />
                </div>
            ) : (
                <div className="px-8 space-y-5">

                    {/* ── Risk Summary Cards ──────────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {RISK_LEVELS.map((cfg, i) => {
                            const d = chartData[i];
                            const n = count(cfg.label);
                            return (
                                <div key={cfg.label} className={`rounded-3xl p-6 border shadow-sm transition-all hover:-translate-y-1 ${isDark ? `${cfg.darkBg} ${cfg.darkBorder} backdrop-blur-md` : `${cfg.bg} ${cfg.border} backdrop-blur-md`}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                                            <span className={`text-sm font-bold ${cfg.textColor}`}>{cfg.label} Risk</span>
                                        </div>
                                        <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{n} samples</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                        {[
                                            ['Temp',      `${d?.temp ?? '—'}°C`],
                                            ['Humidity',  `${d?.humidity ?? '—'}%`],
                                            ['Rainfall',  `${d?.rainfall ?? '—'}mm`],
                                            ['Avg Cases', d?.cases ?? '—'],
                                        ].map(([k, v]) => (
                                            <div key={k}>
                                                <p className={`text-[10px] font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{k}</p>
                                                <p className={`text-base font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{v}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── 4 Mini Bar Charts ───────────────────────────────── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <MiniBar dataKey="temp"     title="Temperature" unit="°C" />
                        <MiniBar dataKey="humidity" title="Humidity"    unit="%" />
                        <MiniBar dataKey="rainfall" title="Rainfall"    unit="mm" />
                        <MiniBar dataKey="cases"    title="Cases"       unit="#" />
                    </div>

                    {/* ── Scatter + Donut ─────────────────────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        {/* Scatter chart */}
                        <div className={`p-6 rounded-3xl border shadow-sm lg:col-span-2 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                <p className={`text-sm font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                    <Activity className="w-4 h-4 text-indigo-500" />
                                    {scatterFactor === 'temperature' ? 'Temperature' : scatterFactor === 'humidity' ? 'Humidity' : 'Rainfall'} vs Dengue Cases
                                </p>
                                <div className="flex gap-1">
                                    {[
                                        { key: 'temperature', label: 'Temperature' },
                                        { key: 'humidity',    label: 'Humidity'    },
                                        { key: 'rainfall',    label: 'Rainfall'    },
                                    ].map(f => (
                                        <button key={f.key}
                                            onClick={() => setScatterFactor(f.key)}
                                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                                                ${scatterFactor === f.key
                                                    ? 'bg-indigo-500 text-white shadow-sm'
                                                    : isDark ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 text-slate-500 hover:text-slate-700'}`}>
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                        <XAxis
                                            dataKey="x" type="number" name={scatterFactor}
                                            tick={axisStyle} axisLine={false} tickLine={false}
                                            label={{ value: scatterFactor === 'temperature' ? '°C' : scatterFactor === 'humidity' ? '%' : 'mm', position: 'insideBottomRight', offset: -5, style: { fontSize: 10, fill: '#94a3b8' } }}
                                        />
                                        <YAxis dataKey="y" type="number" name="cases" tick={axisStyle} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ strokeDasharray: '3 3' }}
                                            content={({ active, payload }) => {
                                                if (active && payload?.length) {
                                                    const d = payload[0].payload;
                                                    return (
                                                        <div className={`text-xs p-2.5 rounded-xl border shadow-lg ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                                                            <p style={{ color: d.color }} className="font-bold mb-0.5">{d.risk} Risk</p>
                                                            <p>{scatterFactor}: <strong>{d.x}</strong></p>
                                                            <p>Cases: <strong>{d.y}</strong></p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        {RISK_LEVELS.map(r => (
                                            <Scatter
                                                key={r.label}
                                                name={r.label}
                                                data={scatterData.filter(d => d.risk === r.label)}
                                                fill={r.color}
                                                opacity={0.72}
                                                r={5}
                                            />
                                        ))}
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Donut chart */}
                        <div className={`p-6 rounded-3xl border shadow-sm ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <p className={`text-sm font-bold mb-4 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                <Droplets className="w-4 h-4 text-sky-500" />
                                Risk Distribution
                            </p>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%"
                                            innerRadius={55} outerRadius={90}
                                            paddingAngle={3} dataKey="value">
                                            {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTip isDark={isDark} />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2 mt-1">
                                {pieData.map(p => (
                                    <div key={p.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                                            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{p.name}</span>
                                        </div>
                                        <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                            {p.value} <span className={`font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({totalSamples ? Math.round(p.value / totalSamples * 100) : 0}%)</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Monthly Trend Line ──────────────────────────────── */}
                    <div className={`p-6 rounded-3xl border shadow-sm mb-6 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <p className={`text-sm font-bold mb-4 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            <CloudRain className="w-4 h-4 text-sky-500" />
                            Monthly Trend — Humidity vs Cases
                        </p>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                    <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                                    <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTip isDark={isDark} />} />
                                    <Legend formatter={v => <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}>{v}</span>} />
                                    <Line type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: '#60a5fa', strokeWidth: 0 }} connectNulls />
                                    <Line type="monotone" dataKey="cases"    name="Avg Cases"   stroke="#a78bfa" strokeWidth={2} dot={{ r: 3, fill: '#a78bfa', strokeWidth: 0 }} connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default CorrelationCharts;
