import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  Home,
  Cpu,
  Thermometer,
  Bell,
  Layers,
} from "lucide-react";
import "./App.css";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// --- PAGE D'ACCUEIL ---
const PageAccueil = () => {
  return (
    <div className="hero-container">
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-header">
          <Home size={60} className="hero-logo" />
          <h1 className="hero-title">
            Bienvenue sur <span className="text-gradient">SmartHome</span>
          </h1>
          <p className="hero-subtitle">
            Prenez le contrôle total de votre installation Arduino avec une
            interface moderne, fluide et intuitive.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card glass">
            <div className="icon-badge purple">
              <Cpu size={22} />
            </div>
            <h3>Contrôle Total</h3>
            <p>Pilotez vos relais et actionneurs ON/OFF en temps réel.</p>
          </div>

          <div className="feature-card glass">
            <div className="icon-badge blue">
              <Thermometer size={22} />
            </div>
            <h3>Capteurs Live</h3>
            <p>Visualisation instantanée des températures et de l'humidité.</p>
          </div>

          <div className="feature-card glass">
            <div className="icon-badge red">
              <Bell size={22} />
            </div>
            <h3>Alertes Intelligentes</h3>
            <p>Notifications instantanées en cas de dépassement de seuil.</p>
          </div>

          <div className="feature-card glass">
            <div className="icon-badge green">
              <Layers size={22} />
            </div>
            <h3>Scénarios</h3>
            <p>Automatisez votre maison selon vos habitudes quotidiennes.</p>
          </div>
        </div>

        <Link to="/register" className="btn-primary">
          Commencer l'aventure
        </Link>

        <div className="corner-star">✦</div>
      </div>
    </div>
  );
};

// --- STRUCTURE PRINCIPALE ---
function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />

        <main className="main">
          <Routes>
            <Route path="/" element={<PageAccueil />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;