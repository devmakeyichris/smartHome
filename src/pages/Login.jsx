import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../App.css';

const API_URL = "http://localhost:8080";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      if (!response.ok) throw new Error("E-mail ou mot de passe incorrect");

      const data = await response.json();

      let homeConfig = [];
      let nomMaison = 'Ma maison';
      let houseId = '1';
      let prenom = data.firstName || '';
      let nom = data.lastName || '';

      try {
        const userResponse = await fetch(`${API_URL}/users/email/${credentials.email}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          prenom = userData.firstName || prenom;
          nom = userData.lastName || nom;

          const relations = userData.houseRelations || [];
          if (relations.length > 0) {
            const house = relations[0]?.house;
            if (house) {
              nomMaison = house.houseName || 'Ma maison';
              houseId = house.id || '1';
              homeConfig = (house.rooms || []).map(room => ({
                roomName: room.name,
                devices: (room.devices || []).map(d => ({
                  type: d.type,
                  pin: d.pin,
                  status: d.state === 'ON' || d.state === 'OPEN'
                }))
              }));
            }
          }
        }
      } catch (fetchErr) {
        console.warn("Impossible de récupérer les détails de la maison :", fetchErr);
      }

      sessionStorage.setItem('userProfile', JSON.stringify({
        nom,
        prenom,
        email: data.email || credentials.email,
        nomMaison,
        role: 'admin',
        houseId
      }));

      sessionStorage.setItem('homeConfig', JSON.stringify(homeConfig));

      window.location.href = '/dashboard';

    } catch (err) {
      console.error("Erreur détectée lors de la connexion :", err);
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'relative', zIndex: 0 }}>
      <div className="register-container" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="register-card" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#667eea', textDecoration: 'none', marginBottom: '20px', fontSize: '0.95rem', fontWeight: '500' }}>
            <ArrowLeft size={16} /> Retour
          </Link>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.2rem', margin: '0 0 10px 0', color: '#1f2937', fontWeight: '700' }}>🔐 Connexion</h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>Accédez à votre maison connectée</p>
          </div>

          {error && (
            <div style={{
              color: '#dc2626',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              padding: '14px',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '0.9rem',
              marginBottom: '25px',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={16} /> Email
              </label>
              <input
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleChange}
                placeholder="marie@example.com"
                required
                style={{ padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', transition: 'all 0.3s ease', boxSizing: 'border-box', fontFamily: 'inherit' }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={16} /> Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '12px 16px', paddingRight: '45px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', transition: 'all 0.3s ease', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ padding: '14px 20px', background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '10px', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}
            >
              <LogIn size={18} /> {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
              Pas encore de compte ?{' '}
              <Link to="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
