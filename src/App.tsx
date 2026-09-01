import React, { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Passenger Experience Components
import PassengerHome from './components/passenger/PassengerHome';
import PassengerTrainTracker from './components/passenger/PassengerTrainTracker';
import BetweenTrainsResults from './components/passenger/BetweenTrainsResults';

// Officer Experience Components
import OfficerCommandCenter from './components/officer/OfficerCommandCenter';
import OverviewDashboard from './components/overview/OverviewDashboard';
import LiveTrainMonitor from './components/monitor/LiveTrainMonitor';
import EtaPredictionsView from './components/predictions/EtaPredictionsView';
import NetworkIntelligenceView from './components/network/NetworkIntelligenceView';
import DelayAnalyticsView from './components/analytics/DelayAnalyticsView';
import TrainDetailsView from './components/details/TrainDetailsView';
import AlertsEventsView from './components/alerts/AlertsEventsView';
import LiveSimulationBar from './components/simulation/LiveSimulationBar';

import { useLiveTrainData } from './hooks/useLiveTrainData';
import { OPERATIONAL_ALERTS } from './data/mockData';
import { NavPage, UserRoleMode } from './types';

export default function App() {
  const [roleMode, setRoleMode] = useState<UserRoleMode>('passenger');
  const [passengerView, setPassengerView] = useState<'home' | 'tracker' | 'between'>('home');
  const [betweenSearchStations, setBetweenSearchStations] = useState<{ from: string; to: string }>({ from: 'HWH', to: 'RNC' });

  const [officerPage, setOfficerPage] = useState<NavPage>('overview');

  const {
    trains,
    selectedTrain,
    selectedTrainId,
    setSelectedTrainId,
    simulationState,
    toggleEvent,
    resetSimulation,
    toastNotification
  } = useLiveTrainData();

  const criticalAlertCount = OPERATIONAL_ALERTS.filter(a => a.severity === 'critical').length;

  const handleSelectTrainFromPassenger = (trainId: string) => {
    setSelectedTrainId(trainId);
    setPassengerView('tracker');
  };

  const handleSearchBetweenFromPassenger = (fromCode: string, toCode: string) => {
    setBetweenSearchStations({ from: fromCode, to: toCode });
    setPassengerView('between');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* 1. TOP GLOBAL HEADER WITH ROLE SWITCHER */}
      <Header
        roleMode={roleMode}
        onRoleChange={(newRole) => {
          setRoleMode(newRole);
          if (newRole === 'passenger') {
            setPassengerView('home');
          }
        }}
        activePage={officerPage}
        trains={trains}
        selectedTrain={selectedTrain}
        onSelectTrain={(tId) => {
          setSelectedTrainId(tId);
          if (roleMode === 'passenger') {
            setPassengerView('tracker');
          } else {
            setOfficerPage('details');
          }
        }}
        onNavigateToPassengerHome={() => {
          setRoleMode('passenger');
          setPassengerView('home');
        }}
        lastUpdated={simulationState.lastTickTimestamp}
      />

      {/* 2. BODY CONTAINER BASED ON ROLE */}
      {roleMode === 'passenger' ? (
        /* PASSENGER EXPERIENCE CONTAINER */
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {passengerView === 'home' && (
            <PassengerHome
              onSelectTrain={handleSelectTrainFromPassenger}
              onSearchBetween={handleSearchBetweenFromPassenger}
            />
          )}

          {passengerView === 'tracker' && (
            <PassengerTrainTracker
              train={selectedTrain}
              onBackToSearch={() => setPassengerView('home')}
              onSelectTrain={handleSelectTrainFromPassenger}
            />
          )}

          {passengerView === 'between' && (
            <BetweenTrainsResults
              fromCode={betweenSearchStations.from}
              toCode={betweenSearchStations.to}
              onSelectTrain={handleSelectTrainFromPassenger}
              onBackToSearch={() => setPassengerView('home')}
            />
          )}
        </main>
      ) : (
        /* OFFICER NETWORK COMMAND CENTER CONTAINER (WITH SIDEBAR) */
        <div className="flex-1 flex min-w-0">
          {/* Officer Sidebar */}
          <Sidebar
            activePage={officerPage}
            onPageChange={setOfficerPage}
            criticalAlertCount={criticalAlertCount}
          />

          {/* Officer Main Content (Offset by Sidebar W-64) */}
          <main className="flex-1 ml-64 p-8 max-w-7xl w-full mx-auto space-y-6 min-w-0">
            {officerPage === 'overview' && (
              <OfficerCommandCenter
                trains={trains}
                onSelectTrain={(tId) => {
                  setSelectedTrainId(tId);
                  setOfficerPage('details');
                }}
              />
            )}

            {officerPage === 'monitor' && (
              <LiveTrainMonitor
                trains={trains}
                onSelectTrain={setSelectedTrainId}
                onNavigateToDetails={() => setOfficerPage('details')}
              />
            )}

            {officerPage === 'predictions' && (
              <EtaPredictionsView
                trains={trains}
                selectedTrain={selectedTrain}
                onSelectTrain={setSelectedTrainId}
                onNavigateToDetails={() => setOfficerPage('details')}
              />
            )}

            {officerPage === 'network' && <NetworkIntelligenceView />}

            {officerPage === 'analytics' && <DelayAnalyticsView />}

            {officerPage === 'details' && (
              <TrainDetailsView
                train={selectedTrain}
                trains={trains}
                onSelectTrain={setSelectedTrainId}
              />
            )}

            {officerPage === 'alerts' && <AlertsEventsView />}
          </main>
        </div>
      )}

      {/* 3. FLOATING SIMULATION ENGINE CONTROLLER (FOR SIH LIVE DEMO) */}
      <LiveSimulationBar
        simulationState={simulationState}
        onToggleEvent={toggleEvent}
        onReset={resetSimulation}
        toastMessage={toastNotification}
      />

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
