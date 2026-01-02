import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Library, Music, Headphones, History } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Music, label: 'Music', path: '/music' },
    { icon: Headphones, label: 'Podcasts', path: '/podcasts' },
    { icon: History, label: 'Recently Played', path: '/recently-played' },
    { icon: Library, label: 'Your Library', path: '/library' }
  ];

  const quickAccess = [
    { icon: Music, label: 'Browse Music', path: '/music' },
    { icon: Headphones, label: 'Browse Podcasts', path: '/podcasts' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-section">
          <h3 className="section-title">Quick Access</h3>
          {quickAccess.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                className="nav-item"
                onClick={() => navigate(item.path)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

