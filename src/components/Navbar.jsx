import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, UserPlus, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { path: '/', label: 'Accueil', icon: <Home size={20} /> },
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/register', label: 'Inscription', icon: <UserPlus size={20} />, isButton: true },
  ];

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
          {navLinks.map((link) =>
            link.isButton ? (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  ...styles.buttonLink,
                  ...(isActive(link.path) ? styles.buttonLinkActive : {}),
                }}
                onClick={closeMenu}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  ...styles.navLink,
                  ...(isActive(link.path) ? styles.navLinkActive : {}),
                }}
                onClick={closeMenu}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            )
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
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.mobileLink,
                ...(link.isButton ? styles.mobileButtonLink : {}),
                ...(isActive(link.path) ? styles.mobileLinkActive : {}),
              }}
              onClick={closeMenu}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
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
  },
}
export default Navbar;