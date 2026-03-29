import React, { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <div className="ambient-bg"></div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          ☰
        </button>
        {children}
      </main>
    </div>
  );
}
