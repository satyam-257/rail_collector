import React from 'react';
import { Cpu, ChevronDown } from 'lucide-react';

export default function Header({ selectedTrain, onSelectTrain, trains }) {
  return (
    <header className="top-header">
      <div className="brand-section">
        <img 
          src="/railvue-logo.png" 
          alt="RailVue AI Logo" 
          style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'contain', background: '#ffffff', padding: 2 }} 
        />
        <div>
          <h1 className="brand-title">
            RailVue <span>AI</span>
          </h1>
          <p className="brand-subtitle">Smarter ETA. Better journeys.</p>
        </div>
      </div>

      <div className="header-right">
        <div className="train-selector-container">
          <select 
            className="train-select"
            value={selectedTrain.id}
            onChange={(e) => onSelectTrain(e.target.value)}
            id="train-select-dropdown"
          >
            {trains.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="train-select-chevron" />
        </div>

        <div className="live-badge">
          <span className="live-dot"></span>
          LIVE
        </div>
      </div>
    </header>
  );
}
