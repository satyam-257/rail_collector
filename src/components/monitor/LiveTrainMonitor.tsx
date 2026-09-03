import React, { useState, useMemo } from 'react';
import { Train } from '../../types';
import { Search, Filter, ArrowUpDown, ExternalLink, RefreshCw } from 'lucide-react';

interface LiveTrainMonitorProps {
  trains: Train[];
  onSelectTrain: (trainId: string) => void;
  onNavigateToDetails: () => void;
}

export default function LiveTrainMonitor({ trains, onSelectTrain, onNavigateToDetails }: LiveTrainMonitorProps) {
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof Train>('delayMinutes');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filtering
  const filteredTrains = useMemo(() => {
    return trains.filter(t => {
      const matchSearch =
        t.number.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.currentLocation.toLowerCase().includes(search.toLowerCase()) ||
        t.origin.toLowerCase().includes(search.toLowerCase()) ||
        t.destination.toLowerCase().includes(search.toLowerCase());

      const matchZone = selectedZone === 'ALL' || t.zone === selectedZone;
      const matchStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
      const matchType = selectedType === 'ALL' || t.type === selectedType;

      return matchSearch && matchZone && matchStatus && matchType;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') valA = (valA as string).toLowerCase();
      if (typeof valB === 'string') valB = (valB as string).toLowerCase();

      if (valA! < valB!) return sortAsc ? -1 : 1;
      if (valA! > valB!) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [trains, search, selectedZone, selectedStatus, selectedType, sortField, sortAsc]);

  const handleSort = (field: keyof Train) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-heading">Actively Monitored Trains</h2>
          <p className="text-xs text-slate-500">
            Real-time operational status, location tracking, and AI arrival projections across Indian Railways
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search train, station..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 focus:border-blue-500 text-xs font-medium text-slate-800 pl-9 pr-3 py-2 rounded-lg outline-none w-56"
            />
          </div>

          {/* Filter Zone */}
          <select
            value={selectedZone}
            onChange={e => setSelectedZone(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-2 rounded-lg outline-none"
          >
            <option value="ALL">All Zones</option>
            <option value="NR">NR (Northern)</option>
            <option value="ER">ER (Eastern)</option>
            <option value="WR">WR (Western)</option>
            <option value="NCR">NCR (North Central)</option>
            <option value="ECR">ECR (East Central)</option>
          </select>

          {/* Filter Delay Status */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-2 rounded-lg outline-none"
          >
            <option value="ALL">All Delay Statuses</option>
            <option value="on_time">🟢 On Time</option>
            <option value="delayed">🟠 Moderate Delay</option>
            <option value="critical">🔴 Critical Delay</option>
          </select>

          {/* Filter Type */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-2 rounded-lg outline-none"
          >
            <option value="ALL">All Train Types</option>
            <option value="Rajdhani">Rajdhani Express</option>
            <option value="Shatabdi">Shatabdi Express</option>
            <option value="Vande Bharat">Vande Bharat</option>
            <option value="Duronto">Duronto Express</option>
          </select>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50 select-none">
                <th onClick={() => handleSort('number')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100">
                  <div className="flex items-center gap-1">
                    <span>Train Number & Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('zone')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100">
                  Zone
                </th>
                <th onClick={() => handleSort('currentLocation')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100">
                  Current Location
                </th>
                <th onClick={() => handleSort('nextStation')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100">
                  Next Station
                </th>
                <th onClick={() => handleSort('currentSpeed')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100">
                  Current Speed
                </th>
                <th onClick={() => handleSort('delayMinutes')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100">
                  Current Delay
                </th>
                <th onClick={() => handleSort('aiPredictedEta')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100">
                  Predicted ETA
                </th>
                <th onClick={() => handleSort('confidenceScore')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100">
                  Confidence
                </th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTrains.map(train => (
                <tr
                  key={train.id}
                  onClick={() => {
                    onSelectTrain(train.id);
                    onNavigateToDetails();
                  }}
                  className="hover:bg-blue-50/50 cursor-pointer transition"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded text-[11px]">
                        {train.number}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{train.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {train.origin} → {train.destination}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono font-bold rounded text-[10px]">
                      {train.zone}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-800">{train.currentLocation}</td>
                  <td className="py-4 px-4 text-slate-600">{train.nextStation}</td>
                  <td className="py-4 px-4 font-mono font-bold text-blue-700">{Math.round(train.currentSpeed)} km/h</td>
                  <td className="py-4 px-4">
                    <span
                      className={`font-mono font-bold px-2.5 py-1 rounded-md ${
                        Math.round(train.delayMinutes) <= 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : Math.round(train.delayMinutes) > 30
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {Math.round(train.delayMinutes) <= 0 ? 'On Time' : `+${Math.round(train.delayMinutes)} min`}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-700 text-sm">
                    {train.aiPredictedEta}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-slate-700">
                    {train.confidenceScore}%
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        train.status === 'on_time'
                          ? 'bg-emerald-100 text-emerald-800'
                          : train.status === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          train.status === 'on_time'
                            ? 'bg-emerald-600'
                            : train.status === 'critical'
                            ? 'bg-rose-600'
                            : 'bg-amber-600'
                        }`}
                      ></span>
                      {train.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
