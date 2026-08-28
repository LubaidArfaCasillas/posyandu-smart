import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import FormTimbang from './pages/FormTimbang';
import DataAnak from './pages/DataAnak';
import RiwayatKms from './pages/RiwayatKms';
import Login from './pages/Login';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAnakForKms, setSelectedAnakForKms] = useState(null);

  // Ambil data sesi login yang tersimpan
  useEffect(() => {
    const savedUser = localStorage.getItem('posyandu_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('posyandu_user');
      }
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari akun?')) {
      localStorage.removeItem('posyandu_user');
      setUser(null);
      setActiveTab('dashboard');
    }
  };

  const handleSelectForTimbang = (anakId) => {
    setActiveTab('timbang');
  };

  const handleViewKms = (anakId) => {
    setSelectedAnakForKms(anakId);
    setActiveTab('riwayat');
  };

  // Jika belum login, tampilkan halaman Login saja
  if (!user) {
    return <Login onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  // Jika sudah login, tampilkan aplikasi utama
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar dengan info user & logout */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

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
