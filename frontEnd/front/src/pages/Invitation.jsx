import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, UserCheck, Mail, Lock } from 'lucide-react';
import '../App.css';

const API_URL = 'http://localhost:8080';

const Invitation = () => {
  const { token } = useParams();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Veuillez renseigner votre nom et prénom.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Veuillez renseigner votre email.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/invitations/join/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          password: formData.password
        })
      });

      if (!response.ok) {
        const text = await response.text();

        try {
          const json = JSON.parse(text);
          throw new Error(json.message || 'Impossible de rejoindre la maison.');
        } catch {
          throw new Error(text || 'Impossible de rejoindre la maison.');
        }
      }

      setSuccess("Votre demande a été envoyée. Attendez l'approbation du propriétaire.");

      setTimeout(() => {
        window.location.href = '/login';
      }, 2500);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur lors de la demande d’invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <div className="register-container" style={{ maxWidth: '520px', width: '100%' }}>
        <div
          className="register-card"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#667eea',
              textDecoration: 'none',
              marginBottom: '20px',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}
          >
            <ArrowLeft size={16} /> Retour
          </Link>

          <div style={{ textAlign: 'center', marginBottom: '35px' }}>
            <h1
              style={{
                fontSize: '2rem',
                margin: '0 0 10px 0',
                color: '#1f2937',
                fontWeight: '700'
              }}
            >
              Rejoindre une maison
            </h1>

            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>
              Complétez vos informations pour envoyer une demande au propriétaire.
            </p>
          </div>

          {error && (
            <div
              style={{
                color: '#dc2626',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                padding: '14px',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '0.9rem',
                marginBottom: '20px',
                fontWeight: '500'
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                color: '#047857',
                backgroundColor: '#d1fae5',
                border: '1px solid #a7f3d0',
                padding: '14px',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '0.9rem',
                marginBottom: '20px',
                fontWeight: '500'
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input
                name="firstName"
                placeholder="Prénom"
                value={formData.firstName}
                onChange={handleChange}
                style={{
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />

              <input
                name="lastName"
                placeholder="Nom"
                value={formData.lastName}
                onChange={handleChange}
                style={{
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Mail
                size={17}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }}
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock
                size={17}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }}
              />
              <input
                name="password"
                type="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock
                size={17}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }}
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '14px 20px',
                background: isSubmitting
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px'
              }}
            >
              <UserCheck size={18} />
              {isSubmitting ? 'Envoi de la demande...' : 'Envoyer la demande'}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '25px',
              paddingTop: '20px',
              borderTop: '1px solid #e5e7eb'
            }}
          >
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
              Déjà inscrit ?{' '}
              <Link
                to="/login"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invitation;