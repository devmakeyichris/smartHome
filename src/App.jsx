import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login'; 
import Dashboard from './pages/Dashboard';
import SetupPage from './pages/SetupPage';
import './App.css';

// 🔒 Composant de protection dynamique basé sur userProfile
function LocalProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const location = useLocation(); // Détecte les changements de page

  useEffect(() => {
    // Lecture rigoureuse du stockage de session à chaque navigation
    const session = sessionStorage.getItem('userProfile');
    
    // Si la session existe (non nulle), hasSession devient true
    setHasSession(!!session);
    setChecking(false);
  }, [location]);

  if (checking) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Vérification de la session...</div>;
  }

  if (!hasSession) {
    // Redirection immédiate vers la page de connexion si non connecté
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        {/* Ta Navbar */}
        <Navbar />
        
        {/* Conteneur principal */}
        <main className="main-content">
          <Routes>
            {/* 🌐 ROUTES PUBLIQUES */}
            <Route path="/" element={<HomeContent />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* 🔒 ROUTES PROTÉGÉES */}
            <Route 
              path="/dashboard" 
              element={
                <LocalProtectedRoute>
                  <Dashboard />
                </LocalProtectedRoute>
              } 
            />
            
            <Route 
              path="/setup" 
              element={
                <LocalProtectedRoute>
                  <SetupPage />
                </LocalProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Composant de la page d'accueil
function HomeContent() {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1>Bienvenue sur <span className="text-gradient">SmartHome Lucide</span></h1>
        <p>Prenez le contrôle total de votre installation Arduino avec une interface moderne et intuitive.</p>
        <div style={{ marginTop: '40px' }}>
          <Link to="/register" className="cta-button">
            Commencer l'aventure
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;