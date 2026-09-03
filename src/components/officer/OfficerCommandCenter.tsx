import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Layers,
  Activity,
  AlertTriangle,
  TrendingUp,
  Clock,
  Train as TrainIcon,
  Flame,
  CloudRain,
  Radio,
  Eye,
  ChevronRight,
  Sparkles,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { Train, CorridorDetail, MapLayersConfig, AffectedTrain } from '../../types';
import NetworkMap from '../overview/NetworkMap';
import { mockTrainService } from '../../services/mockTrainService';

interface OfficerCommandCenterProps {
  trains: Train[];
  onSelectTrain: (trainId: string) => void;
}

export default function OfficerCommandCenter({
  trains,
  onSelectTrain
}: OfficerCommandCenterProps) {
  const [liveNetworkTrains, setLiveNetworkTrains] = useState<any[]>([]);
  const [corridors, setCorridors] = useState<CorridorDetail[]>([]);
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('corridor-cnb-pryj');
  const [networkHealth, setNetworkHealth] = useState<number>(82);
  const [networkStatus, setNetworkStatus] = useState<string>('Moderate Congestion');
  const [affectedTrains, setAffectedTrains] = useState<AffectedTrain[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Map Layer Toggles (Part 13 & 14)
  const [layers, setLayers] = useState<MapLayersConfig>({
    liveTrains: true,
    congestion: true,
    delayRisk: true,
    etaImpact: false,
    weather: false
  });

  const toggleLayer = (key: keyof MapLayersConfig) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    let isMounted = true;
    async function loadNetworkData() {
      try {
        const [congRes, affRes, liveSnapshot] = await Promise.all([
          mockTrainService.getNetworkCongestion(),
          mockTrainService.getAffectedTrains(),
          mockTrainService.getNetworkLiveSnapshot()
        ]);

        if (isMounted) {
          setCorridors(congRes.corridors || []);
          setNetworkHealth(congRes.network_health_score || 82);
          setNetworkStatus(congRes.overall_status || 'Moderate Congestion');
          setAffectedTrains(affRes || []);
          setLiveNetworkTrains(liveSnapshot && liveSnapshot.length > 0 ? liveSnapshot : trains);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (e) {
        // Fallback
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadNetworkData();
    const interval = setInterval(loadNetworkData, 20000); // 20s network refresh
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [trains]);

  const selectedCorridor = corridors.find(c => c.corridor_id === selectedCorridorId) || corridors[0];

  const criticalCorridorsCount = corridors.filter(c => c.congestion_level === 'CRITICAL').length;
  const highRiskTrainsCount = affectedTrains.filter(t => t.risk_level === 'High').length;

  return (
    <div className="space-y-6 pb-12">
      {/* PART 13: OFFICER COMMAND CENTER HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              LIVE OPS CENTER
            </span>
            <span className="text-xs font-bold text-slate-400">
              Indian Railways Trunk Network Visualizer
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-white">
            RailVue AI Network Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time railway corridor density, spatial clustering, and predictive delay propagation monitoring.
          </p>
        </div>

        {/* Global Network Health Dial */}
        <div className="flex items-center gap-4 bg-slate-950/90 border border-slate-800 p-4 rounded-2xl">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
              Network Health
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-cyan-400">
                {networkHealth}
              </span>
              <span className="text-xs text-slate-500 font-semibold">/100</span>
            </div>
            <span className="text-[11px] font-bold text-amber-400">
              {networkStatus}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 font-extrabold text-lg">
            ⚡
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Active Fleet Trains</span>
            <TrainIcon className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            {liveNetworkTrains.length > 0 ? liveNetworkTrains.length.toLocaleString() : trains.length} Units
          </p>
          <p className="text-xs text-slate-500">
            Real-time telemetry across Indian Railways
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Critical Corridors</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-extrabold text-red-600 font-mono">
            {criticalCorridorsCount} Sector{criticalCorridorsCount === 1 ? '' : 's'}
          </p>
          <p className="text-xs text-slate-500">
            Kanpur → Prayagraj at 84% track load
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>High Disruption Risk</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 font-mono">
            {highRiskTrainsCount} Trains
          </p>
          <p className="text-xs text-slate-500">
            Downstream propagation predicted &gt;15m
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Inference Model</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-base font-extrabold text-indigo-700 font-heading">
            Dual XGBoost + RF
          </p>
          <p className="text-xs text-slate-500">
            MAE Error: 10.37 min | 15s interval ticker
          </p>
        </div>
      </div>

      {/* PART 14: MAP LAYER CONTROLS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-slate-800 uppercase tracking-wider">
            Active Map Layers:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggleLayer('liveTrains')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              layers.liveTrains
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span>🚆 Live Trains</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('congestion')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              layers.congestion
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span>🔥 Corridor Congestion</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('delayRisk')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              layers.delayRisk
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span>⚠ Delay Risk</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('etaImpact')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              layers.etaImpact
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span>✨ ETA Disruption</span>
          </button>

          <button
            type="button"
            onClick={() => toggleLayer('weather')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              layers.weather
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span>🌧 Weather Overlay</span>
          </button>
        </div>
      </div>

      {/* PART 13: MAIN MAP VISUALIZER */}
      <NetworkMap
        trains={liveNetworkTrains.length > 0 ? liveNetworkTrains : trains}
        corridors={corridors}
        onSelectTrain={onSelectTrain}
        onSelectCorridor={setSelectedCorridorId}
        selectedCorridorId={selectedCorridorId}
        layers={layers}
        onToggleLayer={toggleLayer}
      />

      {/* PART 15 & 16: CORRIDOR DETAILS & PREDICTIVE INTELLIGENCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Selected Corridor Diagnostics */}
        {selectedCorridor && (
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-7 space-y-6">
            {/* Corridor Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-extrabold ${
                    selectedCorridor.congestion_level === 'CRITICAL'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : selectedCorridor.congestion_level === 'HIGH'
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {selectedCorridor.congestion_level} NETWORK PRESSURE
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Zone: {selectedCorridor.zone}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-heading mt-1">
                  {selectedCorridor.corridor_name}
                </h3>
              </div>

              {/* Corridor Selector Dropdown */}
              <select
                value={selectedCorridorId}
                onChange={(e) => setSelectedCorridorId(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                {corridors.map((c) => (
                  <option key={c.corridor_id} value={c.corridor_id}>
                    {c.corridor_name} ({c.congestion_score}/100)
                  </option>
                ))}
              </select>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Congestion Score
                </span>
                <p className="text-2xl font-mono font-extrabold text-slate-900">
                  {selectedCorridor.congestion_score} <span className="text-xs text-slate-400 font-sans">/ 100</span>
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Active Trains
                </span>
                <p className="text-2xl font-mono font-extrabold text-blue-600">
                  {selectedCorridor.active_trains_count}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Average Delay
                </span>
                <p className="text-2xl font-mono font-extrabold text-amber-600">
                  {selectedCorridor.average_delay_minutes} min
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Delay Trend
                </span>
                <p className="text-lg font-bold text-slate-800 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  {selectedCorridor.trend}
                </p>
              </div>
            </div>

            {/* AI Assessment Alert Box */}
            <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 text-xs space-y-1 text-blue-950">
              <div className="flex items-center gap-1.5 font-bold text-blue-800">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>RailVue AI Assessment</span>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed">
                {selectedCorridor.ai_assessment}
              </p>
            </div>

            {/* Affected Trains Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                  Affected Trains in this Corridor ({selectedCorridor.affected_trains?.length || 0})
                </h4>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {selectedCorridor.affected_trains && selectedCorridor.affected_trains.length > 0 ? (
                  selectedCorridor.affected_trains.map((at) => (
                    <div
                      key={at.train_number}
                      onClick={() => onSelectTrain(at.train_number)}
                      className="p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between text-xs group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-blue-600 group-hover:underline">
                          {at.train_number}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{at.train_name}</p>
                          <p className="text-slate-400 text-[11px]">
                            Current Delay: <strong className="text-amber-600">+{at.current_delay_minutes}m</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block">Predicted Impact</span>
                          <span className="font-mono font-bold text-red-600">
                            +{at.predicted_eta_impact_minutes} min
                          </span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                          at.risk_level === 'High'
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {at.risk_level} Risk
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No severely delayed trains reported in this corridor.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right 1 Col: Predictive Delay Propagation & Warnings */}
        <div className="space-y-4">
          {/* Predictive Warnings Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Predictive Disruption Alerts</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-800">
                  Critical Warning
                </span>
                <h5 className="text-xs font-bold text-slate-100 mt-1">
                  Increasing congestion on Eastern Trunk Line
                </h5>
                <p className="text-[11px] text-slate-400">
                  Multiple trains (12301, 12309) may experience ETA degradation within the Kanpur–Prayagraj sector.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">
                  Weather Advisory
                </span>
                <h5 className="text-xs font-bold text-slate-100 mt-1">
                  Visibility reduction in Barddhaman sector
                </h5>
                <p className="text-[11px] text-slate-400">
                  Moderate fog may add +6–10m for approaching Shatabdi / Duronto trains.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Fleet Delay Watchlist */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              High Disruption Risk Watchlist
            </h4>
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {affectedTrains.slice(0, 4).map((at) => (
                <div
                  key={at.train_number}
                  onClick={() => onSelectTrain(at.train_number)}
                  className="py-2.5 hover:bg-blue-50/60 transition cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-blue-600">{at.train_number}</span>
                    <p className="font-semibold text-slate-800 truncate max-w-[140px]">{at.train_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-red-600 font-mono block">
                      +{at.current_delay_minutes}m
                    </span>
                    <span className="text-[10px] text-slate-400">Delay</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
