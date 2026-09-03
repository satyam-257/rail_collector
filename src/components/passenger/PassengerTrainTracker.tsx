import React, { useState, useEffect } from 'react';
import {
  Train as TrainIcon,
  Clock,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  ArrowLeft,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  Activity,
  Zap,
  Sliders
} from 'lucide-react';
import { Train, PassengerDelayExplanation, StationStop } from '../../types';
import { mockTrainService } from '../../services/mockTrainService';
import LiveMapView from '../map/LiveMapView';
import RailRadarTimeline from '../timeline/RailRadarTimeline';

interface PassengerTrainTrackerProps {
  train: Train;
  onBackToSearch: () => void;
  onSelectTrain: (trainId: string) => void;
}

export default function PassengerTrainTracker({
  train,
  onBackToSearch,
  onSelectTrain
}: PassengerTrainTrackerProps) {
  const [journeyDate, setJourneyDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  const [liveData, setLiveData] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [routeGeoData, setRouteGeoData] = useState<any>(null);
  const [explanation, setExplanation] = useState<PassengerDelayExplanation | null>(null);

  const [selectedStation, setSelectedStation] = useState<StationStop | null>(null);
  const [isWhyEtaOpen, setIsWhyEtaOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  const trainNumber = train.number || train.id;

  // Real Multi-Endpoint Backend Data Fetching
  const loadAllTrainData = React.useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const [liveRes, schedRes, routeRes, expRes] = await Promise.all([
        mockTrainService.getLiveTrainStatus(trainNumber, journeyDate),
        mockTrainService.getTrainSchedule(trainNumber, journeyDate),
        mockTrainService.getTrainRoute(trainNumber, journeyDate),
        mockTrainService.getPassengerEtaExplanation(trainNumber, journeyDate)
      ]);

      if (!liveRes) {
        throw new Error(`Unable to fetch live telemetry for Train ${trainNumber} on ${journeyDate}.`);
      }

      setLiveData(liveRes);
      setScheduleData(schedRes);
      setRouteGeoData(routeRes);
      setExplanation(expRes);
      setLastUpdatedTime(liveRes?.last_updated || new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error('[PassengerTrainTracker] Failed to load train data:', err);
      setFetchError(err.message || `Unable to fetch live data for this train (${trainNumber}).`);
      setLiveData(null);
    } finally {
      setIsLoading(false);
    }
  }, [trainNumber, journeyDate]);

  useEffect(() => {
    loadAllTrainData();
    const interval = setInterval(loadAllTrainData, 15000); // 15s refresh
    return () => {
      clearInterval(interval);
    };
  }, [loadAllTrainData]);

  // Demo Simulation Ticker
  useEffect(() => {
    if (!isDemoMode) return;

    // Initialize baseline simulation if no live data exists
    if (!liveData) {
      setLiveData({
        train_number: trainNumber,
        train_name: train.name || `Express ${trainNumber}`,
        running_status: 'RUNNING',
        current_location: 'In Transit',
        current_segment: `${train.origin || 'Origin'} → ${train.destination || 'Destination'}`,
        previous_station: train.origin || 'Origin Station',
        next_station: train.destination || 'Destination Terminal',
        source_station_name: train.origin || 'Origin',
        source_station_code: train.originCode || 'ORG',
        destination_station_name: train.destination || 'Destination',
        destination_station_code: train.destinationCode || 'DEST',
        current_delay_minutes: 8,
        current_speed_kmph: 68,
        distance_covered_km: 120,
        total_distance_km: 450,
        journey_progress_pct: 27,
        predicted_destination_eta: '19:45',
        confidence_percentage: 95,
        stations: train.timeline || [],
        last_updated: new Date().toLocaleTimeString() + ' IST'
      });
    }

    const demoInterval = setInterval(() => {
      setLiveData((prev: any) => {
        if (!prev) return prev;
        const curCovered = prev.distance_covered_km || 120.0;
        const totDist = prev.total_distance_km || 450.0;
        const nextCovered = curCovered >= totDist ? 10.0 : curCovered + 1.2;
        const nextProg = Math.round((nextCovered / totDist) * 100);

        return {
          ...prev,
          distance_covered_km: nextCovered,
          journey_progress_pct: nextProg,
          current_speed_kmph: Math.round(55 + Math.random() * 20),
          current_delay_minutes: Math.max(0, prev.current_delay_minutes + (Math.random() > 0.5 ? 0.2 : -0.1)),
          last_updated: new Date().toLocaleTimeString() + ' IST'
        };
      });
    }, 3000);

    return () => clearInterval(demoInterval);
  }, [isDemoMode, trainNumber, train, liveData]);

  // Normalized Live Data Fields
  const trainName = liveData?.train_name || train.name || `Train ${trainNumber}`;
  const sourceStationName = liveData?.source_station_name || train.origin || 'Origin';
  const sourceStationCode = liveData?.source_station_code || train.originCode || 'ORG';
  const destinationStationName = liveData?.destination_station_name || train.destination || 'Destination';
  const destinationStationCode = liveData?.destination_station_code || train.destinationCode || 'DEST';

  const runningStatus = isDemoMode ? 'SIMULATED RUNNING' : (liveData?.running_status || 'RUNNING');
  const currentDelay = Math.round(liveData?.current_delay_minutes ?? train.delayMinutes ?? 0);
  const currentSpeed = Math.round(liveData?.current_speed_kmph ?? train.currentSpeed ?? 0);
  const distanceCoveredKm = Math.round(liveData?.distance_covered_km ?? train.distanceCovered ?? 0);
  const totalDistanceKm = Math.round(liveData?.total_distance_km ?? train.totalDistance ?? 0);
  const distanceRemainingKm = Math.max(0, totalDistanceKm - distanceCoveredKm);
  const journeyProgressPct = Math.round(liveData?.journey_progress_pct ?? (totalDistanceKm > 0 ? (distanceCoveredKm / totalDistanceKm) * 100 : 0));

  const currentLocation = liveData?.current_location || (liveData ? 'In Transit' : '--');
  const currentSegment = liveData?.current_segment || `${sourceStationName} → ${destinationStationName}`;
  const previousStation = liveData?.previous_station || sourceStationName;
  const nextStation = liveData?.next_station || destinationStationName;

  const predictedDestinationEta = liveData?.predicted_destination_eta || train.aiPredictedEta || '--:--';
  const confidencePercentage = liveData?.confidence_percentage || 94;
  const isDelayed = currentDelay > 5;

  // Station sequence list
  const rawStations: StationStop[] = (liveData?.stations && liveData.stations.length > 0)
    ? liveData.stations.map((s: any, idx: number) => ({
        id: `st-${s.stationCode || s.station_code}-${idx}`,
        sequence: s.sequence || idx + 1,
        stationName: s.stationName || s.station_name,
        stationCode: s.stationCode || s.station_code,
        scheduledArrival: s.scheduledArrival || s.scheduled_arrival || '--',
        scheduledDeparture: s.scheduledDeparture || s.scheduled_departure || '--',
        actualArrival: s.actualArrival,
        actualDeparture: s.actualDeparture,
        predictedArrival: s.predictedArrival || s.scheduledArrival || '--',
        predictedDeparture: s.predictedDeparture || s.scheduledDeparture || '--',
        delayMinutes: s.delayMinutes ?? currentDelay,
        distanceFromOrigin: s.distanceKm ?? s.distance_km ?? (idx * 25),
        distanceKm: s.distanceKm ?? s.distance_km ?? (idx * 25),
        status: s.status || (idx === 0 ? 'DEPARTED' : (idx === 3 ? 'AT_STATION' : 'UPCOMING')),
        platform: s.platform || `PF ${(idx % 3) + 1}`,
        isHalt: s.isHalt !== false
      }))
    : (train.timeline && train.timeline.length > 0 ? train.timeline : []);

  const totalHalts = liveData?.total_halts || rawStations.filter(s => s.isHalt !== false).length || rawStations.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Navigation & Date Selection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={onBackToSearch}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:text-blue-600 hover:bg-blue-50 text-xs font-bold transition shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Search Another Train</span>
        </button>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Journey Date Picker */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-500 font-semibold">Journey Date:</span>
            <input
              type="date"
              value={journeyDate}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="bg-transparent font-bold font-mono text-slate-800 outline-none cursor-pointer"
            />
          </div>

          {/* Hackathon Demo Mode Toggle */}
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
              isDemoMode
                ? 'bg-amber-500 text-slate-950 shadow-md animate-pulse'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isDemoMode ? 'fill-slate-950' : 'text-slate-500'}`} />
            <span>{isDemoMode ? 'DEMO MODE ACTIVE' : 'Enable Demo Mode'}</span>
          </button>
        </div>
      </div>

      {/* DEMO MODE ACTIVE BANNER */}
      {isDemoMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-3 rounded-2xl font-bold text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <span>
              <strong>DEMO / SIMULATED LIVE DATA ACTIVE:</strong> Real-time position, speed, and ML ETAs are being simulated for hackathon presentation.
            </span>
          </div>
          <span className="bg-slate-950 text-amber-400 px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold uppercase">
            SIMULATION
          </span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !liveData && !isDemoMode && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-4">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">
              Fetching Live Telemetry for Train {trainNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Contacting RailRadar API for real-time tracking data on {journeyDate}...
            </p>
          </div>
        </div>
      )}

      {/* Clear Error State when Live Data Cannot be Fetched */}
      {!isLoading && !liveData && !isDemoMode && (
        <div className="bg-white border border-rose-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900 font-heading">
              Unable to fetch live data for this train
            </h3>
            <p className="text-sm text-slate-600">
              {fetchError || `We could not retrieve live RailRadar tracking information for Train ${trainNumber} on ${journeyDate}.`}
            </p>
            <p className="text-xs text-slate-400">
              Please verify that the train number is valid and currently scheduled on this date, or try picking an adjacent date.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <button
              onClick={() => loadAllTrainData()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Fetch</span>
            </button>

            <button
              onClick={onBackToSearch}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Search Another Train</span>
            </button>

            <button
              onClick={() => setIsDemoMode(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Enable Demo Simulation</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Live Tracking View (Shown when live data or demo mode is active) */}
      {(liveData || isDemoMode) && (
        <>
          {/* ========================================================================= */}
          {/* 1. CORE HERO CARD (RailRadar Summary Specification) */}
          {/* ========================================================================= */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden space-y-6">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Train Number, Name, Route */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
                🚆 {trainNumber}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-heading">
                {trainName}
              </h1>

              {/* Status Badge */}
              <span className={`text-xs font-black uppercase px-3 py-1 rounded-lg flex items-center gap-1.5 ${
                runningStatus === 'ARRIVED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : isDelayed
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${runningStatus === 'ARRIVED' ? 'bg-emerald-400' : isDelayed ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                {runningStatus === 'ARRIVED' ? '✅ ARRIVED / JOURNEY COMPLETED' : `${runningStatus} (${isDelayed ? `+${currentDelay} min delay` : 'On Time'})`}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-300 mt-1 flex items-center gap-2">
              <span className="text-slate-100 font-bold">{sourceStationName} ({sourceStationCode})</span>
              <span className="text-blue-400 font-extrabold">→</span>
              <span className="text-slate-100 font-bold">{destinationStationName} ({destinationStationCode})</span>
            </p>
          </div>

          {/* Destination ETA Spotlight Card */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 text-left md:text-right shrink-0 space-y-1">
            <span className="text-[11px] font-extrabold uppercase text-blue-400 tracking-wider block flex items-center gap-1 md:justify-end font-mono">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Destination ETA
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {predictedDestinationEta}
            </div>
            <div className="text-xs font-semibold text-slate-400">
              {runningStatus === 'ARRIVED' ? (
                <span className="text-emerald-400 font-bold">Successfully Arrived at Destination</span>
              ) : (
                <>Predicted Delay: <strong className="text-amber-400 font-mono">+{currentDelay} min</strong></>
              )}
            </div>
          </div>
        </div>

        {/* 9-Grid Operational Key Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2 relative z-10">
          <div className="bg-slate-800/60 border border-slate-800 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Speed</span>
            <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">{currentSpeed} km/h</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-800 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Distance Covered</span>
            <span className="text-sm sm:text-base font-black text-blue-400 font-mono">{distanceCoveredKm} / {totalDistanceKm} km</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-800 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Journey Progress</span>
            <span className="text-sm sm:text-base font-black text-cyan-400 font-mono">{journeyProgressPct}%</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-800 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Halts</span>
            <span className="text-sm sm:text-base font-black text-slate-200 font-mono">{totalHalts} Stops</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-800 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Running Days</span>
            <span className="text-xs font-bold text-slate-200">Daily</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-800 p-3 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ML Confidence</span>
            <span className="text-sm sm:text-base font-black text-indigo-300 font-mono">{confidencePercentage}%</span>
          </div>
        </div>

        {/* Visual Railway Track Progression Bar */}
        <div className="space-y-2 pt-2 relative z-10">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>{previousStation}</span>
            <span className="text-blue-400 font-extrabold flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              {currentLocation} ({currentSpeed} km/h)
            </span>
            <span>{nextStation}</span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-cyan-400 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${journeyProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REAL INTERACTIVE ROUTE MAP */}
      {/* ========================================================================= */}
      <LiveMapView
        trainNumber={trainNumber}
        trainName={trainName}
        runningStatus={runningStatus}
        currentLocation={currentLocation}
        currentSegment={currentSegment}
        currentSpeed={currentSpeed}
        currentDelay={currentDelay}
        latitude={liveData?.latitude ?? (train as any)?.lat}
        longitude={liveData?.longitude ?? (train as any)?.lng}
        distanceCoveredKm={distanceCoveredKm}
        totalDistanceKm={totalDistanceKm}
        journeyProgressPct={journeyProgressPct}
        lastUpdated={lastUpdatedTime}
        isLive={liveData?.is_live_available !== false}
        isDemo={isDemoMode}
        stations={rawStations}
        selectedStation={selectedStation}
        onSelectStation={(st) => setSelectedStation(st)}
        geoCoordinates={routeGeoData?.geojson?.geometry?.coordinates || []}
      />

      {/* ========================================================================= */}
      {/* 3. ETA EXPLANATION BANNER (WHY DID MY ETA CHANGE?) */}
      {/* ========================================================================= */}
      {explanation && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-3xl p-5 text-amber-950 space-y-3 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-base shrink-0 mt-0.5 shadow-sm">
                ⚠
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-amber-950 font-heading">
                  {explanation.human_summary}
                </h4>
                <p className="text-xs text-amber-800 font-medium">
                  Dynamic ETA calculated by XGBoost Machine Learning model based on live operational telemetry, speed profile, and track congestion.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsWhyEtaOpen(!isWhyEtaOpen)}
              className="text-xs font-extrabold text-amber-950 bg-amber-200/80 hover:bg-amber-200 px-3.5 py-2 rounded-xl transition flex items-center gap-1 shrink-0"
            >
              <span>{isWhyEtaOpen ? 'Hide Breakdown' : 'Why did my ETA change?'}</span>
              {isWhyEtaOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Factor Breakdown List */}
          {isWhyEtaOpen && (
            <div className="pt-3 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {explanation.breakdown.map((item, idx) => (
                <div key={idx} className="bg-white/90 rounded-2xl p-3.5 border border-amber-100 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-base">{item.icon}</span>
                    <span className={`text-xs font-black font-mono ${item.impact_minutes > 0 ? 'text-amber-700' : 'text-emerald-600'}`}>
                      {item.impact_minutes > 0 ? `+${item.impact_minutes} min` : '0 min'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">{item.factor}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. COMPLETE ROUTE TIMELINE (3-Column RailRadar Station View + FAQs) */}
      {/* ========================================================================= */}
      <RailRadarTimeline
        trainNumber={trainNumber}
        trainName={trainName}
        sourceStationName={sourceStationName}
        destinationStationName={destinationStationName}
        totalDistanceKm={totalDistanceKm}
        scheduledDuration={liveData?.scheduled_duration || 'Scheduled'}
        runningDays={['Daily']}
        stations={rawStations}
        currentDelay={currentDelay}
        currentStationCode={liveData?.previous_station_code || liveData?.source_station_code || 'CURR'}
        selectedStation={selectedStation}
        onSelectStation={(st) => setSelectedStation(st)}
      />

      {/* FLOATING "IN TRAIN?" BUTTON (Matching RailRadar UI Specs) */}
      <div className="fixed bottom-24 right-6 z-40">
        <button
          onClick={() => alert(`Broadcasting passenger GPS report for Train ${trainNumber}...`)}
          className="bg-slate-900/90 hover:bg-slate-900 border border-blue-500/50 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 transition hover:scale-105"
        >
          <MapPin className="w-4 h-4 text-blue-400 animate-pulse" />
          <span>In Train?</span>
        </button>
      </div>

      {/* FLOATING BOTTOM LIVE STATUS SHEET (Matching RailRadar Screenshots) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0d1424]/95 backdrop-blur-xl border-t border-slate-800 p-4 text-white shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <span>{currentLocation}</span>
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <span className={`font-black font-mono px-2 py-0.5 rounded text-[11px] ${
                runningStatus === 'ARRIVED' ? 'bg-emerald-600 text-white' : isDelayed ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {runningStatus === 'ARRIVED' ? 'JOURNEY COMPLETED' : isDelayed ? `${Math.round(currentDelay)}M LATE` : 'ON TIME'}
              </span>
              <span className="text-slate-400 text-[11px]">
                Updated {lastUpdatedTime || 'few seconds ago'}
              </span>
            </div>
          </div>

          <button
            onClick={() => loadAllTrainData()}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </>
  )}
    </div>
  );
}
