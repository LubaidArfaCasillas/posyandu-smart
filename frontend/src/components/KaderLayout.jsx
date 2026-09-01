import React from 'react';
import Navbar from './Navbar';

export default function KaderLayout({ activeTab, setActiveTab, user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar & Mobile Bottom Nav (Sama dengan Admin UI) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Responsive Content View */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12">
        {children}
      </main>
    </div>
  );
}
