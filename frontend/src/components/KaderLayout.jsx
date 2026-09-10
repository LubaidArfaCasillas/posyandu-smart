import React from 'react';
import Navbar from './Navbar';

export default function KaderLayout({ activeTab, setActiveTab, user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-[#ebf7f0] text-[#0f172a] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar & Mobile Bottom Nav */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Responsive Content View */}
      <main className="flex-1 max-w-md md:max-w-lg lg:max-w-2xl w-full mx-auto px-3.5 sm:px-4 pt-3 pb-24">
        {children}
      </main>
    </div>
  );
}

