import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SidebarNav } from './components/SidebarNav';
import { MobileNav } from './components/MobileNav';

import { OverviewPage } from './pages/OverviewPage';
import { HeatMapPage } from './pages/HeatMapPage';
import { TemporalPage } from './pages/TemporalPage';
import { LandCoverPage } from './pages/LandCoverPage';
import { HotspotsPage } from './pages/HotspotsPage';
import { ScenarioPage } from './pages/ScenarioPage';
import { DataMethodologyPage } from './pages/DataMethodologyPage';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F7F9FB] text-slate-900 flex flex-col md:flex-row relative selection:bg-blue-100 selection:text-blue-900">
        {/* Mobile Navigation Header */}
        <MobileNav />

        {/* Desktop Navigation Sidebar */}
        <div className="hidden md:block">
          <SidebarNav />
        </div>

        {/* Main Viewport */}
        <main className="flex-1 min-w-0 bg-[#F7F9FB] min-h-screen relative z-10 overflow-y-auto">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/heat-map" element={<HeatMapPage />} />
            <Route path="/temporal" element={<TemporalPage />} />
            <Route path="/land-cover" element={<LandCoverPage />} />
            <Route path="/hotspots" element={<HotspotsPage />} />
            <Route path="/scenario" element={<ScenarioPage />} />
            <Route path="/methodology" element={<DataMethodologyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
