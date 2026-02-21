import { Thermometer, Droplets, CloudRain, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

const SummaryCards = ({ currentData, prediction, isLive }) => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    const cards = [
        {
            title: 'Temperature',
            value: currentData?.temperature != null ? `${currentData.temperature}°C` : '--',
            sub: 'Live reading',
            icon: Thermometer,
            color: 'text-orange-400',
            bg: 'bg-orange-400/10',
        },
        {
            title: 'Humidity',
            value: currentData?.humidity != null ? `${currentData.humidity}%` : '--',
            sub: 'Relative humidity',
            icon: Droplets,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
        },
        {
            title: 'Rainfall',
            value: currentData?.rainfall != null ? `${currentData.rainfall}mm` : '--',
            sub: 'Last 1 hour',
            icon: CloudRain,
            color: 'text-cyan-400',
            bg: 'bg-cyan-400/10',
        },
        {
            title: `Today's Risk — ${currentData?.city || 'Your City'}`,
            value: prediction?.risk_level || '--',
            sub: prediction?.confidence ? `${prediction.confidence}% confidence` : 'Awaiting data',
            icon: AlertTriangle,
            color: prediction?.color === 'red' ? 'text-red-400' : prediction?.color === 'yellow' ? 'text-yellow-400' : 'text-green-400',
            bg: prediction?.color === 'red' ? 'bg-red-500/10' : prediction?.color === 'yellow' ? 'bg-yellow-500/10' : 'bg-green-500/10',
        },
    ];

    return (
        <div className="mb-8">
            {/* Date + Live status banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                    <p className="text-sm text-slate-400">{dateStr}</p>
                    {currentData?.description && (
                        <p className="text-xs text-slate-500 mt-0.5">☁️ {currentData.description}</p>
                    )}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${isLive
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-slate-700/50 border-slate-600 text-slate-400'
                    }`}>
                    {isLive ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                    {isLive ? 'Live Weather · OpenWeatherMap' : 'Estimated Data (Offline)'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <div
                        key={index}
                        className="glass-panel p-6 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300 animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className={`p-4 rounded-2xl ${card.bg} shrink-0`}>
                            <card.icon className={`w-8 h-8 ${card.color}`} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-400 font-medium truncate">{card.title}</p>
                            <h3 className="text-2xl font-bold text-white mt-0.5">{card.value}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SummaryCards;
