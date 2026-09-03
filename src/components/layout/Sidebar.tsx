import {
  LayoutDashboard,
  Activity,
  Sparkles,
  Network,
  BarChart3,
  TrainFront,
  BellRing,
  Settings,
  Cpu,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activePage: NavPage;
  onPageChange: (page: NavPage) => void;
  criticalAlertCount: number;
}

export default function Sidebar({ activePage, onPageChange, criticalAlertCount }: SidebarProps) {
  const navItems = [
    { id: 'overview' as NavPage, label: 'Overview', icon: LayoutDashboard },
    { id: 'monitor' as NavPage, label: 'Live Train Monitor', icon: Activity },
    { id: 'predictions' as NavPage, label: 'ETA Predictions', icon: Sparkles, badge: 'AI' },
    { id: 'network' as NavPage, label: 'Network Intelligence', icon: Network },
    { id: 'analytics' as NavPage, label: 'Delay Analytics', icon: BarChart3 },
    { id: 'details' as NavPage, label: 'Train Details', icon: TrainFront },
    {
      id: 'alerts' as NavPage,
      label: 'Alerts & Events',
      icon: BellRing,
      count: criticalAlertCount
    }
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-100 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800/80 z-30 select-none shadow-2xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex flex-col gap-1.5 bg-slate-950">
        <div className="flex items-center gap-3">
          <img
            src="/railvue-logo.png"
            alt="RailVue AI Logo"
            className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-md shadow-cyan-500/20 ring-1 ring-white/20"
          />
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-1 text-white font-heading">
              RailVue <span className="text-cyan-400">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Smarter ETA. Better journeys.
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Operations Command
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                      isActive
                        ? 'bg-cyan-400/20 text-cyan-100 border border-cyan-300/30'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 font-mono shadow-sm">
                    {item.count}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-300 ml-0.5" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Control Room Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 flex flex-col gap-2">
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 ring-2 ring-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
              IR
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-200 leading-tight">Control Room</p>
              <p className="text-[10px] text-slate-400 font-mono">Telemetry Active</p>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
        </div>
      </div>
    </aside>
  );
}
