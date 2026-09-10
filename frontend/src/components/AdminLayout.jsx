import React from 'react';
import Navbar from './Navbar';

export default function AdminLayout({ activeTab, setActiveTab, user, onLogout, children }) {
  return (
    <div className="min-h-screen bg-[#ebf7f0] text-[#0f172a] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Responsive Content View */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-28 md:pb-12">
        {children}
      </main>
    </div>
  );
}


