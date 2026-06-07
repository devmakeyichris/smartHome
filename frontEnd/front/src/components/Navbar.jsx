import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, UserPlus, LogIn, LogOut, Menu, X } from 'lucide-react';
import './Navbar.css';
import logoSmartHome from '../assets/logo.jpeg';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const userProfile = JSON.parse(sessionStorage.getItem('userProfile'));

  const isActive = (path) => location.pathname === path;
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    sessionStorage.removeItem('userProfile');
    sessionStorage.removeItem('homeConfig');
    closeMenu();
    window.location.href = '/login';
  };

  return (
    <nav className="nav-container">
      <div className="nav-wrapper">
        {/* LOGO */}
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <img
            src={logoSmartHome}
            alt="SmartHome Logo"
            style={{
              width: '42px',
              height: '42px',
              objectFit: 'contain',
              borderRadius: '8px',
              display: 'block'
            }}
          />
          <span className="logo-text">
            Smart<span className="logo-strong">Home</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <Home size={18} />
            <span>Accueil</span>
          </Link>

          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>

          {userProfile ? (
            <div className="auth-group">
              <span className="user-badge">👤 {userProfile.prenom}</span>
              <button onClick={handleLogout} className="logout-button">
                <LogOut size={16} />
                <span>Déconnexion</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
                <LogIn size={18} />
                <span>Connexion</span>
              </Link>
              <Link to="/register" className={`button-link ${isActive('/register') ? 'btn-active' : ''}`}>
                <UserPlus size={18} />
                <span>Inscription</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="menu-button">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className={`mobile-link ${isActive('/') ? 'active' : ''}`} onClick={closeMenu}>
            <Home size={20} /> <span>Accueil</span>
          </Link>
          <Link to="/dashboard" className={`mobile-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={closeMenu}>
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </Link>

          {userProfile ? (
            <div className="mobile-auth-box">
              <span className="mobile-user-badge">👤 {userProfile.prenom}</span>
              <button onClick={handleLogout} className="mobile-link mobile-logout-btn">
                <LogOut size={20} /> <span>Déconnexion</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className={`mobile-link ${isActive('/login') ? 'active' : ''}`} onClick={closeMenu}>
                <LogIn size={20} /> <span>Connexion</span>
              </Link>
              <Link to="/register" className="mobile-link mobile-button-link" onClick={closeMenu}>
                <UserPlus size={20} /> <span>Inscription</span>
              </Link>
            </>
          )}
        </div>
      )}

      {/* Overlay */}
      {isMenuOpen && <div className="nav-overlay" onClick={closeMenu} />}
    </nav>
  );
};

export default Navbar;