import React, { useState } from 'react';
import { Search, Bell, Clock, Cpu, ChevronDown, User, ShieldAlert, Sparkles, Train as TrainIcon, Navigation } from 'lucide-react';
import { Train, NavPage, UserRoleMode } from '../../types';

interface HeaderProps {
  roleMode: UserRoleMode;
  onRoleChange: (role: UserRoleMode) => void;
  activePage: NavPage;
  trains: Train[];
  selectedTrain: Train;
  onSelectTrain: (trainId: string) => void;
  onNavigateToPassengerHome: () => void;
  lastUpdated: string;
}

export default function Header({
  roleMode,
  onRoleChange,
  activePage,
  trains,
  selectedTrain,
  onSelectTrain,
  onNavigateToPassengerHome,
  lastUpdated
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filteredSearch = searchQuery.trim()
    ? trains.filter(
        t =>
          t.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.currentLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.destination.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className={`bg-slate-950/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-20 px-6 sm:px-8 py-3.5 shadow-xl flex flex-wrap items-center justify-between gap-4 transition-all duration-200 ${roleMode === 'officer' ? 'lg:ml-64' : ''}`}>
      {/* Brand & Role Mode Switcher */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateToPassengerHome}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
            <TrainIcon className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight font-heading flex items-center gap-1.5">
              RailVue <span className="text-cyan-400">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Smarter ETA. Better journeys.
            </p>
          </div>
        )}

        {/* ROLE EXPERIENCE SWITCHER PILL */}
        <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl flex items-center shadow-inner">
          <button
            type="button"
            onClick={() => onRoleChange('passenger')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              roleMode === 'passenger'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Passenger</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleChange('officer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              roleMode === 'officer'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Officer Command</span>
          </button>
        </div>
      </div>

      {/* Right Controls: Train Search + Status Indicator */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Fast Train Search Bar */}
        <div className="relative w-56 sm:w-64">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search train (e.g. 12019)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs font-medium text-slate-200 pl-9 pr-4 py-2 rounded-xl outline-none transition"
            />
          </div>

          {/* Search Dropdown Results */}
          {isSearchFocused && filteredSearch.length > 0 && (
            <div className="absolute top-full right-0 w-72 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 max-h-72 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase bg-slate-950">
                Matching Trains ({filteredSearch.length})
              </div>
              {filteredSearch.map(train => (
                <button
                  key={train.id}
                  onClick={() => {
                    onSelectTrain(train.id);
                    setSearchQuery('');
                  }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-slate-800/80 flex items-center justify-between transition group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition">
                      {train.number} {train.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {train.origin} → {train.destination}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                    train.delayMinutes <= 5
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {train.delayMinutes === 0 ? 'On Time' : `+${train.delayMinutes}m`}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Telemetry Ticker Badge */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-bold text-slate-300 font-mono">
            {lastUpdated || 'LIVE'}
          </span>
        </div>
      </div>
    </header>
  );
}
