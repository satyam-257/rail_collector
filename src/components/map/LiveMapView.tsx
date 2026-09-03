import React, { useState, useMemo } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { StationStop } from '../../types';
import { getStationCoordinate } from '../../data/stationCoordinates';

interface LiveMapViewProps {
  trainNumber: string;
  trainName: string;
  runningStatus: string;
  currentLocation: string;
  currentSegment?: string;
  currentSpeed: number;
  currentDelay: number;
  latitude: number;
  longitude: number;
  distanceCoveredKm: number;
  totalDistanceKm: number;
  journeyProgressPct: number;
  lastUpdated: string;
  isLive: boolean;
  isDemo?: boolean;
  stations: StationStop[];
  selectedStation?: StationStop | null;
  onSelectStation?: (station: StationStop) => void;
  geoCoordinates?: [number, number][]; // [lng, lat]
}

interface ResolvedWaypoint {
  lat: number;
  lng: number;
  code: string;
  name: string;
  distanceKm: number;
  isHalt: boolean;
  isCurrent: boolean;
  isOrigin: boolean;
  isDestination: boolean;
}

export default function LiveMapView({
  trainNumber,
  trainName,
  runningStatus,
  currentLocation,
  currentSegment,
  currentSpeed,
  currentDelay,
  latitude,
  longitude,
  distanceCoveredKm,
  totalDistanceKm,
  journeyProgressPct,
  lastUpdated,
  isLive,
  isDemo = false,
  stations = [],
  selectedStation,
  onSelectStation,
  geoCoordinates = []
}: LiveMapViewProps) {
  const [mapZoom, setMapZoom] = useState(1);
  const [activeLayer, setActiveLayer] = useState<'standard' | 'satellite' | 'congestion'>('standard');

  const roundedSpeed = Math.round(currentSpeed || 0);
  const roundedDelay = Math.round(currentDelay || 0);
  const roundedCovered = Math.round(distanceCoveredKm || 0);
  const roundedTotal = Math.round(totalDistanceKm || 1);
  const roundedProgress = Math.min(100, Math.max(0, Math.round(journeyProgressPct || (roundedTotal > 0 ? (roundedCovered / roundedTotal) * 100 : 0))));

// Major Indian Railways station coordinates dictionary for accurate route plotting
const MAJOR_STATION_COORDS: Record<string, [number, number]> = {
  // [latitude, longitude]
  NDLS: [28.6139, 77.2090],
  DLI: [28.6609, 77.2274],
  NZM: [28.5888, 77.2534],
  ANVT: [28.6508, 77.3153],
  CNB: [26.4499, 80.3319],
  PRYJ: [25.4358, 81.8463],
  DDU: [25.2819, 83.1147],
  MGS: [25.2819, 83.1147],
  GAYA: [24.7955, 84.9994],
  DHN: [23.7957, 86.4304],
  ASN: [23.6889, 86.9661],
  HWH: [22.5851, 88.3426],
  SDAH: [22.5675, 88.3712],
  KOAA: [22.6025, 88.3778],
  MMCT: [18.9696, 72.8194],
  CSMT: [18.9400, 72.8353],
  BDTS: [19.0624, 72.8407],
  BCT: [18.9696, 72.8194],
  PNVL: [18.9894, 73.1175],
  ROHA: [18.4372, 73.1189],
  RN: [16.9944, 73.3000],
  MAO: [15.2736, 73.9581],
  ST: [21.2049, 72.8311],
  BRC: [22.3107, 73.1812],
  ADI: [23.0225, 72.5714],
  RTM: [23.3340, 75.0375],
  KOTA: [25.2138, 75.8648],
  SWM: [25.9935, 76.3571],
  MTJ: [27.4924, 77.6737],
  AGC: [27.1593, 77.9946],
  GWL: [26.2183, 78.1828],
  VGLJ: [25.4484, 78.5685],
  BPL: [23.2599, 77.4126],
  RKMP: [23.2294, 77.4262],
  ET: [22.6139, 77.7639],
  JBP: [23.1815, 79.9534],
  NGP: [21.1458, 79.0882],
  BSP: [22.0797, 82.1409],
  R: [21.2514, 81.6296],
  TATA: [22.7719, 86.1956],
  RNC: [23.3441, 85.3096],
  BKSC: [23.6693, 86.1511],
  BBS: [20.2644, 85.8436],
  CTC: [20.4625, 85.8830],
  PURI: [19.8135, 85.8312],
  BSB: [25.3176, 82.9972],
  LKO: [26.8310, 80.9230],
  LJN: [26.8310, 80.9230],
  GKP: [26.7606, 83.3732],
  PNBE: [25.6022, 85.1376],
  PPTA: [25.6022, 85.1000],
  MAS: [13.0827, 80.2707],
  MS: [13.0800, 80.2750],
  SBC: [12.9784, 77.5683],
  YPR: [13.0234, 77.5504],
  HYB: [17.3916, 78.4682],
  SC: [17.4334, 78.5015],
  BZA: [16.5062, 80.6480],
  VSKP: [17.7231, 83.2986],
  JP: [26.9196, 75.7878],
  AII: [26.4499, 74.6399],
  JU: [26.2389, 73.0243],
  ASR: [31.6340, 74.8723],
  JAT: [32.7060, 74.8790],
  CDG: [30.7046, 76.8013],
  HW: [29.9457, 78.1642],
  DDN: [30.3165, 78.0322],
  ERS: [9.9674, 76.2907],
  TVC: [8.4875, 76.9525],
  CBE: [11.0016, 76.9628],
  MDU: [9.9252, 78.1198]
};

  const isDelayed = currentDelay > 5;
  const isRunning = runningStatus.toUpperCase().includes('RUNNING') || runningStatus.toUpperCase().includes('LIVE');

  // 1. Resolve waypoints with accurate geographic coordinates
  interface ResolvedWaypoint {
    lat: number;
    lng: number;
    code: string;
    name: string;
    isHalt: boolean;
    isCurrent: boolean;
    status: string;
    platform?: string;
    scheduledArrival?: string;
  }

  const rawList = (stations && stations.length > 0) ? stations : [];
  const waypoints: ResolvedWaypoint[] = [];

  // Pass 1: Gather known coordinates
  const knownCoords: (([number, number]) | null)[] = rawList.map(st => {
    if (st.latitude && st.longitude && st.latitude > 5 && st.longitude > 65) {
      return [st.latitude, st.longitude];
    }
    const code = (st.stationCode || '').toUpperCase().trim();
    if (MAJOR_STATION_COORDS[code]) {
      return MAJOR_STATION_COORDS[code];
    }
    return null;
  });

  // Pass 2: Fill gaps by interpolating between nearest known stations
  const totalSt = rawList.length;
  rawList.forEach((st, idx) => {
    let coord = knownCoords[idx];

    if (!coord) {
      // Find nearest previous known
      let prevIdx = -1;
      for (let p = idx - 1; p >= 0; p--) {
        if (knownCoords[p]) { prevIdx = p; break; }
      }
      // Find nearest next known
      let nextIdx = -1;
      for (let n = idx + 1; n < totalSt; n++) {
        if (knownCoords[n]) { nextIdx = n; break; }
      }

      if (prevIdx !== -1 && nextIdx !== -1) {
        const factor = (idx - prevIdx) / (nextIdx - prevIdx);
        const pCoord = knownCoords[prevIdx]!;
        const nCoord = knownCoords[nextIdx]!;
        coord = [
          pCoord[0] + (nCoord[0] - pCoord[0]) * factor,
          pCoord[1] + (nCoord[1] - pCoord[1]) * factor
        ];
      } else if (prevIdx !== -1) {
        coord = knownCoords[prevIdx]!;
      } else if (nextIdx !== -1) {
        coord = knownCoords[nextIdx]!;
      } else {
        // Fallback generic route spread across Northern/Western India
        const ratio = totalSt > 1 ? idx / (totalSt - 1) : 0.5;
        coord = [19.0 + (28.6 - 19.0) * ratio, 72.8 + (77.2 - 72.8) * ratio];
      }
    }

    waypoints.push({
      lat: coord[0],
      lng: coord[1],
      code: st.stationCode || `ST${idx + 1}`,
      name: st.stationName || st.stationCode || `Station ${idx + 1}`,
      isHalt: st.isHalt !== false,
      isCurrent: st.status === 'AT_STATION' || st.status === 'current',
      status: st.status || 'UPCOMING',
      platform: st.platform,
      scheduledArrival: st.scheduledArrival
    });
  });

  // Fallback if no stations present at all
  if (waypoints.length === 0) {
    waypoints.push(
      { lat: 18.9696, lng: 72.8194, code: 'ORG', name: 'Origin', isHalt: true, isCurrent: false, status: 'DEPARTED' },
      { lat: 28.6139, lng: 77.2090, code: 'DEST', name: 'Destination', isHalt: true, isCurrent: false, status: 'UPCOMING' }
    );
  }

  // 2. Compute dynamic auto-fit bounding box with uniform padding
  const lats = waypoints.map(w => w.lat);
  const lngs = waypoints.map(w => w.lng);
  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);
  let minLng = Math.min(...lngs);
  let maxLng = Math.max(...lngs);

  // Guarantee minimum dimension to prevent division by zero or single point collapse
  const minDimension = 0.5;
  if (maxLat - minLat < minDimension) {
    const mid = (maxLat + minLat) / 2;
    minLat = mid - minDimension / 2;
    maxLat = mid + minDimension / 2;
  }
  if (maxLng - minLng < minDimension) {
    const mid = (maxLng + minLng) / 2;
    minLng = mid - minDimension / 2;
    maxLng = mid + minDimension / 2;
  }

  // Add 16% padding around coordinates for clean margins and label visibility
  const latMargin = (maxLat - minLat) * 0.16;
  const lngMargin = (maxLng - minLng) * 0.16;
  minLat -= latMargin;
  maxLat += latMargin;
  minLng -= lngMargin;
  maxLng += lngMargin;

  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;

  const SVG_WIDTH = 800;
  const SVG_HEIGHT = 420;
  const PADDING_X = 65;
  const PADDING_Y = 50;

  const toSvgX = (lng: number) => {
    return PADDING_X + ((lng - minLng) / lngSpan) * (SVG_WIDTH - 2 * PADDING_X);
  };
  const toSvgY = (lat: number) => {
    // Invert Y axis so higher latitude is at the top of the canvas
    return PADDING_Y + ((maxLat - lat) / latSpan) * (SVG_HEIGHT - 2 * PADDING_Y);
  };

  // 3. Compute SVG path points
  const points = waypoints.map(w => ({ x: toSvgX(w.lng), y: toSvgY(w.lat) }));
  const fullPolylinePoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ');
  const pathD = points.length > 1 ? `M ${fullPolylinePoints}` : `M 80,210 L 720,210`;

  // 4. Snap train position precisely onto the route polyline according to journey progress
  const getTrainRoutePosition = () => {
    if (points.length === 0) return { x: 400, y: 210 };
    if (points.length === 1) return { x: points[0].x, y: points[0].y };

    // Cumulative leg lengths
    const legLengths: number[] = [0];
    for (let i = 1; i < points.length; i++) {
      const d = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
      legLengths.push(legLengths[i - 1] + (d || 1));
    }
    const totalLen = legLengths[legLengths.length - 1];
    const clampedProgress = Math.max(0, Math.min(100, journeyProgressPct || 0)) / 100;
    const targetDistance = clampedProgress * totalLen;

    for (let i = 1; i < legLengths.length; i++) {
      if (targetDistance <= legLengths[i]) {
        const segStart = legLengths[i - 1];
        const segEnd = legLengths[i];
        const segRatio = (targetDistance - segStart) / (segEnd - segStart || 1);
        return {
          x: points[i - 1].x + (points[i].x - points[i - 1].x) * segRatio,
          y: points[i - 1].y + (points[i].y - points[i - 1].y) * segRatio,
          segIndex: i - 1
        };
      }
    }

    const last = points[points.length - 1];
    return { x: last.x, y: last.y, segIndex: points.length - 2 };
  };

  const trainPos = getTrainRoutePosition();
  const trainX = trainPos.x;
  const trainY = trainPos.y;

  // Build partial traveled path up to train position
  const traveledPoints = [];
  for (let i = 0; i <= (trainPos.segIndex ?? 0); i++) {
    traveledPoints.push(`${points[i].x.toFixed(1)},${points[i].y.toFixed(1)}`);
  }
  traveledPoints.push(`${trainX.toFixed(1)},${trainY.toFixed(1)}`);
  const traveledPathD = traveledPoints.length > 1 ? `M ${traveledPoints.join(' L ')}` : '';

  const originStation = waypoints[0];
  const destStation = waypoints[waypoints.length - 1];

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
      {/* Top Map Action Bar */}
      <div className="bg-slate-950/85 backdrop-blur-md px-5 py-3.5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3 text-white relative z-20">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading block">
              Live Route Geometry & GPS Telemetry
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {originStation ? `${originStation.name} (${originStation.code})` : 'Origin'} → {destStation ? `${destStation.name} (${destStation.code})` : 'Destination'}
            </span>
          </div>
          {isDemo && (
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              DEMO / SIMULATION
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Layer switcher */}
          <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-800">
            <button
              onClick={() => setActiveLayer('standard')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                activeLayer === 'standard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Route Vector
            </button>
            <button
              onClick={() => setActiveLayer('congestion')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                activeLayer === 'congestion' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Congestion Heat
            </button>
          </div>

          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            {lastUpdated || 'Live Sync'}
          </span>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="relative w-full h-[440px] bg-slate-950 overflow-hidden select-none">
        {/* Subtle Railway Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

        {/* SVG Route Geometry Map */}
        <svg viewBox="0 0 800 420" className="w-full h-full relative z-10">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="congestionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="trainGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="trainGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Route Path Shadow */}
          <path
            d={pathD}
            fill="none"
            stroke="#0f172a"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Full / Remaining Route (Dashed slate) */}
          <path
            d={pathD}
            fill="none"
            stroke="#334155"
            strokeWidth="5"
            strokeDasharray="8 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Traveled Route (Solid glowing gradient up to train) */}
          {traveledPathD && (
            <path
              d={traveledPathD}
              fill="none"
              stroke={activeLayer === 'congestion' ? 'url(#congestionGradient)' : 'url(#routeGradient)'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          )}

          {/* Station Stop Pins along route */}
          {waypoints.map((st, idx) => {
            const pt = points[idx];
            if (!pt) return null;
            const x = pt.x;
            const y = pt.y;
            const isSelected = selectedStation?.stationCode === st.code;
            const isDeparted = idx <= (trainPos.segIndex ?? 0);

            return (
              <g
                key={`map-st-${st.code}-${idx}`}
                className="cursor-pointer group"
                onClick={() => {
                  const matched = stations.find(s => s.stationCode === st.code);
                  if (matched && onSelectStation) onSelectStation(matched);
                }}
              >
                {/* Station Node Halo on Hover/Selected */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 10 : (st.isHalt ? 7 : 4.5)}
                  fill={isSelected ? '#38bdf8' : (isDeparted ? '#10b981' : (st.isHalt ? '#ffffff' : '#64748b'))}
                  opacity={isSelected ? 0.35 : 0.15}
                  className="group-hover:scale-150 transition-all duration-300"
                />
                {/* Main Station Dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 6 : (st.isHalt ? 4.5 : 3)}
                  fill={isSelected ? '#38bdf8' : (isDeparted ? '#34d399' : (st.isHalt ? '#ffffff' : '#64748b'))}
                  stroke={isSelected ? '#0284c7' : '#0f172a'}
                  strokeWidth="2"
                  className="transition-all duration-300 group-hover:scale-125"
                />
                {/* Station Code Label */}
                {st.isHalt && (
                  <text
                    x={x}
                    y={y + 16}
                    fill={isSelected ? '#38bdf8' : (isDeparted ? '#cbd5e1' : '#94a3b8')}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="font-mono tracking-tight group-hover:fill-white transition filter drop-shadow"
                  >
                    {st.code}
                  </text>
                )}
              </g>
            );
          })}

          {/* Current Live Train Marker (Anchored directly on track) */}
          <g transform={`translate(${trainX}, ${trainY})`} className="transition-all duration-500 ease-out z-30 pointer-events-none">
            {/* Radar Pulse Rings */}
            <circle cx="0" cy="0" r="22" fill="#3b82f6" opacity="0.25" className="animate-ping" />
            <circle cx="0" cy="0" r="14" fill="#3b82f6" opacity="0.45" />
            <circle cx="0" cy="0" r="10" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" filter="url(#trainGlow)" />
            <text x="0" y="3.5" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
              🚆
            </text>

            {/* Live Speed Tooltip Floating on Train */}
            <g transform="translate(0, -18)">
              <rect
                x={-28}
                y={-12}
                width={56}
                height={16}
                rx={6}
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="1"
                className="shadow-lg"
              />
              <text
                x={0}
                y={-1}
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                className="font-mono"
              >
                {roundedSpeed > 0 ? `${roundedSpeed} km/h` : 'Stopped'}
              </text>
            </g>
          </g>
        </svg>

        {/* Floating Live Telemetry Overlay Card */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-84 bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl p-4 text-white shadow-2xl z-20 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                LIVE GPS TELEMETRY
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-cyan-300 bg-slate-800 px-2 py-0.5 rounded">
              {roundedSpeed > 0 ? `${roundedSpeed} km/h` : 'Station Halt'}
            </span>
          </div>

          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Track Segment</p>
            <h4 className="text-xs font-bold text-slate-100 leading-snug">
              {currentSegment || currentLocation}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1.5 text-[11px] font-mono border-t border-slate-800/80">
            <div>
              <span className="text-slate-400 block text-[10px]">PROGRESS</span>
              <strong className="text-blue-400 font-bold">{roundedProgress}%</strong> ({roundedCovered}/{roundedTotal} km)
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">DELAY STATUS</span>
              <strong className={`font-bold ${isDelayed ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isDelayed ? `+${roundedDelay} min` : 'On Time'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Offline / Unavailable Warning Banner */}
      {!isLive && (
        <div className="bg-amber-950/90 border-t border-amber-800/80 px-4 py-2 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>LIVE DATA UNAVAILABLE — Displaying latest cached route telemetry</span>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase bg-amber-900 px-2 py-0.5 rounded text-amber-300">
            Timetable Mode
          </span>
        </div>
      )}
    </div>
  );
}
