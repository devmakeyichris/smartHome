import { useState } from 'react';
import { Mail, Lock, Check } from 'lucide-react';
import '../App.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Appel vers l'API de ton binôme (Spring Boot sur le port 8080)
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(credentials)
      });

      // Si le serveur répond avec une erreur (ex: 401 ou 404)
      if (!response.ok) {
        throw new Error("E-mail ou mot de passe incorrect");
      }

      const data = await response.json();

      // Sauvegarde des données de l'utilisateur renvoyées par MySQL
      sessionStorage.setItem('userProfile', JSON.stringify({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        nomMaison: data.nomMaison,
        role: data.role,
        houseId: data.houseId
      }));

      // Sauvegarde de la configuration des pièces si elle existe
      if (data.homeConfig) {
        sessionStorage.setItem('homeConfig', JSON.stringify(data.homeConfig));
      }

      // Redirection instantanée vers le tableau de bord
      window.location.href = '/dashboard';

    } catch (err) {
      // Capture les erreurs réseau (ex: serveur éteint) ou les erreurs d'identifiants
      if (err.message === "Failed to fetch") {
        setError("Impossible de contacter le serveur. Vérifiez que Spring Boot est démarré.");
      } else {
        setError(err.message || "Erreur de connexion au serveur");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container" style={{ maxWidth: '450px', margin: '80px auto', padding: '0 20px' }}>
      <div className="register-card">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🔑 Connexion</h2>
        
        {/* Affichage des erreurs en rouge */}
        {error && (
          <p style={{ 
            color: '#ef4444', 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fee2e2', 
            padding: '10px', 
            borderRadius: '6px', 
            textAlign: 'center', 
            fontSize: '0.9rem' 
          }}>
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '20px' }}>
          <div className="input-group">
            <label><Mail size={16} /> Email</label>
            <input 
              name="email" 
              type="email" 
              value={credentials.email} 
              onChange={handleChange} 
              placeholder="marie@example.com" 
              required 
            />
          </div>

          <div className="input-group">
            <label><Lock size={16} /> Mot de passe</label>
            <input 
              name="password" 
              type="password" 
              value={credentials.password} 
              onChange={handleChange} 
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="cta-button" disabled={isLoading}>
            {isLoading ? "Vérification..." : "Se connecter"} <Check size={18} />
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#64748b' }}>
          Pas encore de compte ? <a href="/register" style={{ color: '#4f46e5', fontWeight: 'bold' }}>S'inscrire</a>
        </p>
      </div>
    </div>
  );
};

export default Login;