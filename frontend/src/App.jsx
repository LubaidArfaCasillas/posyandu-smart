import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import FormTimbang from './pages/FormTimbang';
import DataAnak from './pages/DataAnak';
import RiwayatKms from './pages/RiwayatKms';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAnakForKms, setSelectedAnakForKms] = useState(null);

  const handleSelectForTimbang = (anakId) => {
    setActiveTab('timbang');
  };

  const handleViewKms = (anakId) => {
    setSelectedAnakForKms(anakId);
    setActiveTab('riwayat');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Responsive Content View */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigateToTimbang={() => setActiveTab('timbang')}
            onNavigateToAnak={() => setActiveTab('anak')}
            onViewKms={handleViewKms}
          />
        )}

        {activeTab === 'timbang' && (
          <FormTimbang
            onNavigateToAnak={() => setActiveTab('anak')}
            onSaved={() => {}}
          />
        )}

        {activeTab === 'anak' && (
          <DataAnak
            onSelectForTimbang={handleSelectForTimbang}
            onViewKms={handleViewKms}
          />
        )}

        {activeTab === 'riwayat' && (
          <RiwayatKms
            initialAnakId={selectedAnakForKms}
            onNavigateToTimbang={handleSelectForTimbang}
          />
        )}
      </main>
    </div>
  );
}
