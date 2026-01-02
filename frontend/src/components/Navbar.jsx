import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, User, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <h1 className="navbar-logo" onClick={() => navigate('/')}>
            Lamentix
          </h1>
        </div>
        <div className="navbar-center">
          <div className="search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search for songs, artists, albums..."
              onFocus={() => navigate('/search')}
            />
          </div>
        </div>
        <div className="navbar-right">
          {user && (
            <div className="user-menu">
              <div className="user-info">
                <User size={20} />
                <span>{user.username}</span>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

