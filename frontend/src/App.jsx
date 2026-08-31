import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout';
import KaderLayout from './components/KaderLayout';
import Dashboard from './pages/Dashboard';
import FormTimbang from './pages/FormTimbang';
import DataAnak from './pages/DataAnak';
import RiwayatKms from './pages/RiwayatKms';
import KelolaKader from './pages/KelolaKader';
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

  const isAdmin = user?.role === 'admin_puskesmas';
  const LayoutComponent = isAdmin ? AdminLayout : KaderLayout;

  return (
    <LayoutComponent
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && (
        <Dashboard
          user={user}
          onNavigateToTimbang={() => setActiveTab('timbang')}
          onNavigateToAnak={() => setActiveTab('anak')}
          onViewKms={handleViewKms}
        />
      )}

      {activeTab === 'kader' && <KelolaKader />}

      {activeTab === 'timbang' && (
        <FormTimbang
          user={user}
          onNavigateToAnak={() => setActiveTab('anak')}
          onSaved={() => {}}
        />
      )}

      {activeTab === 'anak' && (
        <DataAnak
          user={user}
          onSelectForTimbang={handleSelectForTimbang}
          onViewKms={handleViewKms}
        />
      )}

      {activeTab === 'riwayat' && (
        <RiwayatKms
          user={user}
          initialAnakId={selectedAnakForKms}
          onNavigateToTimbang={handleSelectForTimbang}
        />
      )}
    </LayoutComponent>
  );
}

