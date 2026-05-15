import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SetupPage from './pages/SetupPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        {/* On enveloppe les routes pour un meilleur contrôle du layout */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomeContent />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/setup" element={<SetupPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function HomeContent() {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1>Bienvenue sur <span className="text-gradient">SmartHome Licide</span></h1>
        <p>Prenez le contrôle total de votre installation Arduino avec une interface moderne et intuitive.</p>
        <div style={{ marginTop: '40px' }}>
          {/* Utilisation de Link pour une navigation ultra-rapide */}
          <Link to="/register" className="cta-button">
            Commencer l'aventure
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;