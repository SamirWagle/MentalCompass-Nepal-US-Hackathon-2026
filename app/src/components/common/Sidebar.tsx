import React from 'react';
import { useApp } from '@hooks/useApp';
import type { ScreenKey } from '../../types';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { currentScreen, navigateToScreen, uxMode, setUxMode, isFullMode } = useApp();

  const handleNavClick = (screen: ScreenKey) => {
    navigateToScreen(screen);
    onClose();
  };

  const navItems: Array<{ screen: ScreenKey; label: string; icon: string; section: string; fullOnly?: boolean }> = [
    { screen: 'dashboard', label: 'Home', icon: '◎', section: 'Wellness' },
    { screen: 'copilot', label: 'Talk to AI', icon: '🤖', section: 'Wellness' },
    { screen: 'checkin', label: 'Daily Check-In', icon: '📊', section: 'Wellness' },
    { screen: 'journal', label: 'Journal', icon: '📝', section: 'Wellness' },
    { screen: 'milestones', label: 'Milestones', icon: '🏆', section: 'Wellness' },
    { screen: 'vault', label: 'Vault', icon: '📚', section: 'Wellness' },
    { screen: 'community', label: 'Community', icon: '💬', section: 'Wellness' },
    { screen: 'booking', label: 'Book Doctor', icon: '🩺', section: 'Wellness' },
    { screen: 'signals', label: 'Voice Signals', icon: '📡', section: 'Advanced', fullOnly: false },
    { screen: 'insights', label: 'Predictive Insights', icon: '🔮', section: 'Advanced', fullOnly: false },
    { screen: 'triage', label: 'Triage', icon: '🚦', section: 'Advanced', fullOnly: true },
    { screen: 'alerts', label: 'Alerts', icon: '🚨', section: 'Advanced', fullOnly: true },
    { screen: 'compliance', label: 'Compliance', icon: '✅', section: 'Advanced', fullOnly: true },
    { screen: 'clinician', label: 'Clinician', icon: '🏥', section: 'Advanced', fullOnly: true },
    { screen: 'privacy', label: 'Privacy & Data', icon: '🔒', section: 'System' },
    { screen: 'settings', label: 'Settings', icon: '⚙️', section: 'System' },
    { screen: 'wipelog', label: 'Wipe Log', icon: '🗑️', section: 'System' },
    { screen: 'admin', label: 'Admin', icon: '🛡️', section: 'System', fullOnly: true },
  ];

  const grouped = navItems
    .filter(item => !item.fullOnly || isFullMode)
    .reduce<Record<string, typeof navItems>>( (acc, item) => {
      acc[item.section] = acc[item.section] || [];
      acc[item.section].push(item);
      return acc;
    }, {});

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <a className="sidebar-logo" href="#/">
            <div className="logo-icon">🛡️</div>
            <div>
              <div className="logo-text">AegisSpeak</div>
              <div className="logo-sub">Mental Health</div>
            </div>
          </a>
          <div className="ux-mode-toggle">
            <button
              className={`mode-btn ${uxMode === 'calm' ? 'active' : ''}`}
              onClick={() => setUxMode('calm')}
              type="button"
            >
              Calm
            </button>
            <button
              className={`mode-btn ${uxMode === 'full' ? 'active' : ''}`}
              onClick={() => setUxMode('full')}
              type="button"
            >
              Full
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {Object.entries(grouped).map(([section, items]) => (
            <React.Fragment key={section}>
              <div className="nav-section-label">{section}</div>
              {items.map(item => (
                <button
                  key={item.screen}
                  className={`nav-item ${currentScreen === item.screen ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.screen)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              ))}
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="footer-link">Settings ⚙️</button>
          <button className="footer-link">Help 📖</button>
        </div>
      </aside>
    </>
  );
}
