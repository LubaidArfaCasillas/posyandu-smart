import React from 'react';
import Navbar from './Navbar';

export default function AdminLayout({ activeTab, setActiveTab, user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar dengan info user & logout asli */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Responsive Content View Asli */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12">
        {children}
      </main>
    </div>
  );
}

