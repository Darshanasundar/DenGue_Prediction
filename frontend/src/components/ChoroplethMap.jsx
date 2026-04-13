import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useTheme } from '../ThemeContext';
import { MapPin, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const RISK_CONFIG = {
    High:     { color: '#ef4444', fillColor: '#ef4444', textColor: 'text-red-500',     softBg: 'bg-red-50',     darkBg: 'bg-red-950/20',    icon: AlertTriangle,  border: 'border-red-200',    darkBorder: 'border-red-900/40' },
    Moderate: { color: '#f59e0b', fillColor: '#f59e0b', textColor: 'text-amber-500',   softBg: 'bg-amber-50',   darkBg: 'bg-amber-950/20',  icon: AlertCircle,    border: 'border-amber-200',  darkBorder: 'border-amber-900/40' },
    Low:      { color: '#10b981', fillColor: '#10b981', textColor: 'text-emerald-500', softBg: 'bg-emerald-50', darkBg: 'bg-emerald-950/20', icon: CheckCircle,    border: 'border-emerald-200', darkBorder: 'border-emerald-900/40' },
};

// Approximate lat/lon for supported cities
const CITY_COORDS = {
    Agra:              [27.18, 78.01], Ahmedabad:       [23.02, 72.57], Amritsar:        [31.63, 74.87],
    Bangalore:         [12.97, 77.59], Bhopal:          [23.26, 77.40], Bhubaneswar:     [20.30, 85.82],
    Chandigarh:        [30.73, 76.78], Chennai:         [13.08, 80.27], Dehradun:        [30.32, 78.03],
    Delhi:             [28.61, 77.21], Erode:           [11.34, 77.72], Faridabad:       [28.41, 77.31],
    Ghaziabad:         [28.66, 77.43], Guwahati:        [26.14, 91.74], Hyderabad:       [17.39, 78.49],
    Indore:            [22.72, 75.86], Jaipur:          [26.92, 75.79], Kanpur:          [26.46, 80.33],
    Kochi:             [9.93,  76.27], Kolkata:         [22.57, 88.36], Lucknow:         [26.85, 80.95],
    Ludhiana:          [30.90, 75.85], Meerut:          [28.98, 77.71], Mumbai:          [19.08, 72.88],
    Nagpur:            [21.15, 79.09], Nashik:          [19.99, 73.79], Patna:           [25.59, 85.14],
    Pune:              [18.52, 73.86], Rajkot:          [22.30, 70.80], Shimla:          [31.10, 77.17],
    Srinagar:          [34.08, 74.80], Surat:           [21.19, 72.83], Thane:           [19.22, 72.98],
    Thiruvananthapuram:[8.52,  76.94], Vadodara:        [22.31, 73.19], Varanasi:        [25.32, 82.97],
    Visakhapatnam:     [17.69, 83.22],
};

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const monthShort  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const ChoroplethMap = () => {
    const { isDark } = useTheme();
    const [geoData, setGeoData]       = useState(null);
    const [cityRiskData, setCityRiskData] = useState([]);
    const [month, setMonth]            = useState(new Date().getMonth() + 1);
    const [loading, setLoading]        = useState(true);
    const [selectedCity, setSelectedCity] = useState(null);

    useEffect(() => {
        fetch('/india_state.geojson').then(r => r.json()).then(setGeoData).catch(console.error);
    }, []);

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:8000/api/city-risk-map?month=${month}`)
            .then(({ data }) => setCityRiskData(data.cities))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [month]);

    const stateRisks = useMemo(() => {
        const risks = {};
        cityRiskData.forEach(c => {
            if (!risks[c.state]) risks[c.state] = c.risk_level;
            else if (c.risk_level === 'High') risks[c.state] = 'High';
            else if (c.risk_level === 'Moderate' && risks[c.state] !== 'High') risks[c.state] = 'Moderate';
        });
        return risks;
    }, [cityRiskData]);

    const stats = useMemo(() => ({
        high:     cityRiskData.filter(c => c.risk_level === 'High').length,
        moderate: cityRiskData.filter(c => c.risk_level === 'Moderate').length,
        low:      cityRiskData.filter(c => c.risk_level === 'Low').length,
    }), [cityRiskData]);

    const getStyle = (feature) => {
        const risk = stateRisks[feature.properties.NAME_1] || 'Low';
        return {
            fillColor: RISK_CONFIG[risk]?.color || '#10b981',
            weight: 1.2,
            opacity: 1,
            color: isDark ? '#1e293b' : '#ffffff',
            fillOpacity: loading ? 0.15 : 0.60,
        };
    };

    const onEachFeature = (feature, layer) => {
        const name = feature.properties.NAME_1;
        const risk = stateRisks[name] || 'Low';
        layer.bindTooltip(`<strong>${name}</strong><br/>Risk: ${risk}`, {
            permanent: false, direction: 'auto', className: 'leaflet-custom-tooltip'
        });
    };

    const citiesWithCoords = useMemo(() =>
        cityRiskData.filter(c => CITY_COORDS[c.city]),
    [cityRiskData]);

    const highCities     = cityRiskData.filter(c => c.risk_level === 'High');
    const moderateCities = cityRiskData.filter(c => c.risk_level === 'Moderate');

    return (
        <div className="pb-12 space-y-0">

            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className={`px-8 pt-6 pb-4 ${isDark ? '' : ''}`}>
                <p className="text-sky-500 text-[10px] font-bold uppercase tracking-widest mb-1">Geospatial Surveillance</p>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            India Risk Map
                        </h1>
                        <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            State-level choropleth with city-level circle markers. Drag the slider to time-travel through months.
                        </p>
                    </div>

                    {/* Inline risk badges */}
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                            {loading ? '—' : stats.high} High
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                            {loading ? '—' : stats.moderate} Moderate
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                            {loading ? '—' : stats.low} Low
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Time Engine slider ────────────────────────────────────────── */}
            <div className={`mx-8 mb-5 px-5 py-4 rounded-2xl border flex items-center gap-5
                ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center
                        ${isDark ? 'bg-sky-900/40' : 'bg-sky-100'}`}>
                        <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Time Engine</span>
                </div>

                {/* Month ticks */}
                <div className="flex-1 relative">
                    <div className="flex justify-between text-[10px] mb-1">
                        {monthShort.map((m, i) => (
                            <span key={m} className={`${i + 1 === month ? 'text-sky-500 font-bold' : isDark ? 'text-slate-600' : 'text-slate-400'}`}>{m}</span>
                        ))}
                    </div>
                    <input
                        type="range" min="1" max="12" step="1"
                        value={month}
                        onChange={e => setMonth(parseInt(e.target.value))}
                        className="w-full accent-sky-500 h-2 rounded-full cursor-pointer"
                    />
                </div>

                <span className={`flex-shrink-0 text-sm font-extrabold px-3 py-1 rounded-lg
                    ${isDark ? 'bg-sky-900/30 text-sky-400' : 'bg-sky-100 text-sky-700'}`}>
                    {monthShort[month - 1]}
                </span>
            </div>

            {/* ── Map + Right Panel ─────────────────────────────────────────── */}
            <div className="mx-8 grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Map */}
                <div className={`lg:col-span-2 rounded-3xl overflow-hidden border shadow-inner relative
                    ${isDark ? 'border-slate-700/50 bg-slate-900/50' : 'border-slate-200/80 bg-white'}`}
                    style={{ height: 520 }}>

                    {/* Legend overlay */}
                    <div className={`absolute bottom-8 left-3 z-[500] flex flex-col gap-1.5 px-3 py-3 rounded-xl shadow-lg border text-xs
                        ${isDark ? 'bg-slate-900/95 border-slate-700 text-slate-300' : 'bg-white/95 border-slate-200 text-slate-700'}`}>
                        <p className={`text-[9px] uppercase tracking-widest mb-0.5 font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Risk Level</p>
                        {Object.entries(RISK_CONFIG).map(([level, cfg]) => (
                            <div key={level} className="flex items-center gap-2 font-medium">
                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                                {level}
                            </div>
                        ))}
                        <p className={`text-[9px] mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Click a city for details</p>
                    </div>

                    {geoData ? (
                        <MapContainer center={[22.5937, 78.9629]} zoom={4.5} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                            <TileLayer
                                url={isDark
                                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
                                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                            />
                            {!loading && (
                                <GeoJSON
                                    data={geoData}
                                    style={getStyle}
                                    onEachFeature={onEachFeature}
                                    key={`geojson-${isDark}-${month}`}
                                />
                            )}
                            {/* City circle markers */}
                            {!loading && citiesWithCoords.map((city, i) => {
                                const cfg = RISK_CONFIG[city.risk_level] || RISK_CONFIG.Low;
                                const coords = CITY_COORDS[city.city];
                                return (
                                    <CircleMarker
                                        key={`${city.city}-${i}`}
                                        center={coords}
                                        radius={city.risk_level === 'High' ? 8 : city.risk_level === 'Moderate' ? 7 : 5}
                                        pathOptions={{
                                            fillColor: cfg.color,
                                            fillOpacity: 0.85,
                                            color: '#fff',
                                            weight: 1.5,
                                        }}
                                        eventHandlers={{ click: () => setSelectedCity(city) }}
                                    >
                                        <LeafletTooltip direction="auto" offset={[0, -4]} opacity={0.97}>
                                            <span style={{ fontSize: 12, fontWeight: 700 }}>{city.city}</span><br />
                                            <span style={{ color: cfg.color, fontSize: 11, fontWeight: 600 }}>{city.risk_level} Risk</span>
                                            {city.humidity && <><br /><span style={{ fontSize: 11 }}>{city.humidity}% RH</span></>}
                                        </LeafletTooltip>
                                    </CircleMarker>
                                );
                            })}
                        </MapContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full gap-3">
                            <div className={`w-8 h-8 border-[3px] rounded-full animate-spin ${isDark ? 'border-slate-700 border-t-sky-500' : 'border-slate-200 border-t-sky-500'}`} />
                            <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Loading map geometry…</span>
                        </div>
                    )}
                </div>

                {/* Right Panel */}
                <div className="flex flex-col gap-4" style={{ maxHeight: 520, overflowY: 'auto' }}>

                    {/* Selected city detail */}
                    <div className={`p-5 rounded-2xl border backdrop-blur-md shadow-sm transition-all ${isDark ? 'border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/60' : 'border-slate-200/60 bg-white/60 hover:bg-white/80'}`}>
                        {selectedCity ? (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className={`w-4 h-4 ${RISK_CONFIG[selectedCity.risk_level]?.textColor}`} />
                                    <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{selectedCity.city}</p>
                                    <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full ${RISK_CONFIG[selectedCity.risk_level]?.textColor} ${isDark ? RISK_CONFIG[selectedCity.risk_level]?.darkBg : RISK_CONFIG[selectedCity.risk_level]?.softBg}`}>
                                        {selectedCity.risk_level}
                                    </span>
                                </div>
                                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{selectedCity.state}</p>
                                {selectedCity.humidity && (
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        {[
                                            ['Humidity', `${selectedCity.humidity}% RH`],
                                            ['Temperature', selectedCity.temperature ? `${selectedCity.temperature}°C` : '—'],
                                            ['Rainfall', selectedCity.rainfall !== undefined ? `${selectedCity.rainfall}mm` : '—'],
                                            ['Month', monthNames[month - 1]],
                                        ].map(([k, v]) => (
                                            <div key={k} className={`p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                                <p className={`text-[9px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{k}</p>
                                                <p className={`text-sm font-bold mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{v}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                                <MapPin className={`w-6 h-6 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Click any city circle or the map to see detailed stats
                                </p>
                            </div>
                        )}
                    </div>

                    {/* High Risk Cities */}
                    <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-sm transition-all ${isDark ? 'border-red-900/30 bg-red-950/10 hover:bg-red-950/20' : 'border-red-200/50 bg-red-50/50 hover:bg-red-50/80'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>High Risk Cities</p>
                        </div>
                        {loading ? (
                            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Loading…</div>
                        ) : highCities.length === 0 ? (
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No high-risk cities this month</p>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {highCities.map((c, i) => (
                                    <button key={i} onClick={() => setSelectedCity(c)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                                            ${isDark ? 'bg-red-950/20 hover:bg-red-950/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}>
                                        <span className="font-semibold">{c.city}</span>
                                        {c.humidity && <span className="text-xs font-mono">{c.humidity}%RH</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Moderate Risk Cities */}
                    <div className={`p-4 rounded-2xl border backdrop-blur-md shadow-sm transition-all ${isDark ? 'border-amber-900/30 bg-amber-950/10 hover:bg-amber-950/20' : 'border-amber-200/50 bg-amber-50/50 hover:bg-amber-50/80'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Moderate Risk</p>
                        </div>
                        {loading ? (
                            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Loading…</div>
                        ) : moderateCities.length === 0 ? (
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No moderate-risk cities this month</p>
                        ) : (
                            <div className="space-y-1.5">
                                {moderateCities.slice(0, 8).map((c, i) => (
                                    <button key={i} onClick={() => setSelectedCity(c)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                                            ${isDark ? 'bg-amber-950/20 hover:bg-amber-950/40 text-amber-400' : 'bg-amber-50 hover:bg-amber-100 text-amber-700'}`}>
                                        <span className="font-semibold">{c.city}</span>
                                        {c.humidity && <span className="text-xs font-mono">{c.humidity}%RH</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChoroplethMap;
