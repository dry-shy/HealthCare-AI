import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiHome, FiCamera, FiActivity, FiHeart, FiMapPin, FiGrid } from 'react-icons/fi';
import { useState } from 'react';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/health-check', label: 'Photo Check', icon: FiCamera },
    { path: '/symptoms', label: 'Symptoms', icon: FiActivity },
    { path: '/remedies', label: 'Remedies', icon: FiHeart },
    { path: '/hospitals', label: 'Hospitals', icon: FiMapPin },
    { path: '/dashboard', label: 'Dashboard', icon: FiGrid, auth: true }
  ];

  const filteredLinks = navLinks.filter(link => !link.auth || isAuthenticated);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <span>+</span>
          </div>
          <span className="logo-text">HealthCare AI</span>
        </Link>

        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            {filteredLinks.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`nav-link ${location.pathname === path ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  
                  <Icon className="nav-icon" />
                  <span>{label}</span>
                </Link>
              </li>
              
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <button className="user-button">
                <FiUser />
                <span>{user?.name || 'User'}</span>
              </button>
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item">
                  <FiUser /> Profile
                </Link>
                
                <Link to="/dashboard" className="dropdown-item">
                  <FiGrid /> Dashboard
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <FiLogOut /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
