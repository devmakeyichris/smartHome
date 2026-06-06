import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, UserPlus, LogIn, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Lecture du profil connecté dans la session courante
  const userProfile = JSON.parse(sessionStorage.getItem('userProfile'));

  const isActive = (path) => location.pathname === path;
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Fonction de déconnexion sécurisée (sans vider la base MySQL)
  const handleLogout = () => {
    sessionStorage.removeItem('userProfile');
    sessionStorage.removeItem('homeConfig');
    closeMenu();
    window.location.href = '/login'; // Redirection vers la page de connexion
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoText}>
            SmartHome <strong style={styles.logoStrong}>Home</strong>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div style={styles.desktopLinks}>
          <Link to="/" style={{ ...styles.navLink, ...(isActive('/') ? styles.navLinkActive : {}) }}>
            <Home size={20} />
            <span>Accueil</span>
          </Link>
          
          <Link to="/dashboard" style={{ ...styles.navLink, ...(isActive('/dashboard') ? styles.navLinkActive : {}) }}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          {/* Affichage conditionnel : Connecté VS Déconnecté */}
          {userProfile ? (
            <div style={styles.authGroup}>
              <span style={styles.userBadge}>👤 {userProfile.prenom}</span>
              <button onClick={handleLogout} style={styles.logoutButton}>
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" style={{ ...styles.navLink, ...(isActive('/login') ? styles.navLinkActive : {}) }}>
                <LogIn size={20} />
                <span>Connexion</span>
              </Link>
              <Link to="/register" style={{ ...styles.buttonLink, ...(isActive('/register') ? styles.buttonLinkActive : {}) }}>
                <UserPlus size={20} />
                <span>Inscription</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          style={styles.menuButton}
          aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={{ ...styles.mobileLink, ...(isActive('/') ? styles.mobileLinkActive : {}) }} onClick={closeMenu}>
            <Home size={20} /> <span>Accueil</span>
          </Link>
          <Link to="/dashboard" style={{ ...styles.mobileLink, ...(isActive('/dashboard') ? styles.mobileLinkActive : {}) }} onClick={closeMenu}>
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </Link>

          {userProfile ? (
            <div style={styles.mobileAuthBox}>
              <span style={styles.mobileUserBadge}>👤 {userProfile.prenom}</span>
              <button onClick={handleLogout} style={{ ...styles.mobileLink, ...styles.mobileLogoutBtn }}>
                <LogOut size={20} /> <span>Déconnexion</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" style={{ ...styles.mobileLink, ...(isActive('/login') ? styles.mobileLinkActive : {}) }} onClick={closeMenu}>
                <LogIn size={20} /> <span>Connexion</span>
              </Link>
              <Link to="/register" style={{ ...styles.mobileLink, ...styles.mobileButtonLink, ...(isActive('/register') ? styles.mobileLinkActive : {}) }} onClick={closeMenu}>
                <UserPlus size={20} /> <span>Inscription</span>
              </Link>
            </>
          )}
        </div>
      )}

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div
          style={styles.overlay}
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </nav>
  );
};

// Styles en pur JavaScript corrigés et complétés pour le responsive
const styles = {
  nav: {
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
  },
  logo: {
    textDecoration: 'none',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '500',
  },
  logoStrong: {
    color: '#2563eb',
    fontWeight: '700',
  },
  desktopLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    // Cache la navigation desktop sur les petits écrans (géré idéalement par CSS Média Queries, mais émulé ici)
    '@media (maxWidth: 768px)': { display: 'none' } 
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    textDecoration: 'none',
    color: '#4b5563',
    fontWeight: '500',
    fontSize: '0.95rem',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  navLinkActive: {
    color: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  buttonLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    textDecoration: 'none',
    color: '#ffffff',
    backgroundColor: '#2563eb',
    fontWeight: '500',
    fontSize: '0.95rem',
    padding: '8px 16px',
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  buttonLinkActive: {
    backgroundColor: '#1d4ed8',
  },
  authGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    paddingLeft: '15px',
    borderLeft: '2px solid #e5e7eb',
  },
  userBadge: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1e40af',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#ef4444',
    color: '#ffffff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9rem',
  },
  menuButton: {
    display: 'none', // Par défaut caché sur PC, à afficher via CSS sur mobile
    background: 'none',
    border: 'none',
    color: '#374151',
    cursor: 'pointer',
    padding: '4px',
  },
  mobileMenu: {
    position: 'absolute',
    top: '65px',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: '20px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 999,
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: '#374151',
    fontWeight: '500',
    padding: '12px',
    borderRadius: '8px',
  },
  mobileLinkActive: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
  },
  mobileButtonLink: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    justifyContent: 'center',
  },
  mobileAuthBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '12px',
  },
  mobileUserBadge: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: '4px',
  },
  mobileLogoutBtn: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    justifyContent: 'center',
  },
  overlay: {
    position: 'fixed',
    top: '64px',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 998,
  }
};

export default Navbar;