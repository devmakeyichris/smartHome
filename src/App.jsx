import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login'; // Importation de la page de connexion
import Dashboard from './pages/Dashboard';
import SetupPage from './pages/SetupPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        {/* La Navbar corrigée s'affiche partout et gère la déconnexion */}
        <Navbar />
        
        {/* Conteneur principal pour le contenu de tes pages */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomeContent />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/setup" element={<SetupPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Composant de la page d'accueil (Route: "/")
function HomeContent() {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1>Bienvenue sur <span className="text-gradient">SmartHome Lucide</span></h1>
        <p>Prenez le contrôle total de votre installation Arduino avec une interface moderne et intuitive.</p>
        <div style={{ marginTop: '40px' }}>
          {/* Redirection rapide vers l'inscription */}
          <Link to="/register" className="cta-button">
            Commencer l'aventure
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;