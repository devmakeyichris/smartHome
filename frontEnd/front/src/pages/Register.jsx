import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Home,
  ArrowLeft,
  ArrowRight,
  Check,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import '../App.css';

const Register = () => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const query = new URLSearchParams(useLocation().search);
  const invitedHouseId = query.get('houseId');

  const [userData, setUserData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    nomMaison: '',
    houseId: invitedHouseId || '',
    nbPieces: 1
  });

  const [piecesDetails, setPiecesDetails] = useState([]);

  useEffect(() => {
    if (invitedHouseId) {
      setUserData(prev => ({
        ...prev,
        houseId: invitedHouseId
      }));

      fetchHouseInfo(invitedHouseId);
    }
  }, [invitedHouseId]);

  const fetchHouseInfo = async (houseId) => {
    try {
      const response = await fetch(`http://localhost:8080/houses/${houseId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const houseData = await response.json();

        setUserData(prev => ({
          ...prev,
          nomMaison: houseData.houseName || 'Maison partagée'
        }));
      } else {
        setUserData(prev => ({
          ...prev,
          nomMaison: 'Maison partagée'
        }));
      }
    } catch (error) {
      console.error('Erreur récupération maison :', error);

      setUserData(prev => ({
        ...prev,
        nomMaison: 'Maison partagée'
      }));
    }
  };

  useEffect(() => {
    if (invitedHouseId) return;

    const count = parseInt(userData.nbPieces) || 0;

    const newPieces = Array.from({ length: count }, (_, i) => ({
      id: i,
      nom: piecesDetails[i]?.nom || '',
      pinLumiere: piecesDetails[i]?.pinLumiere || '',
      pinPorte: piecesDetails[i]?.pinPorte || '',
      isMainDoor: piecesDetails[i]?.isMainDoor || false
    }));

    setPiecesDetails(newPieces);
  }, [userData.nbPieces, invitedHouseId]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;

    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePieceChange = (index, field, value) => {
    const updatedPieces = [...piecesDetails];

    if (field === 'isMainDoor' && value === true) {
      updatedPieces.forEach((piece, i) => {
        updatedPieces[i].isMainDoor = i === index;
      });
    } else {
      updatedPieces[index][field] = value;
    }

    setPiecesDetails(updatedPieces);
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (userData.prenom.trim().length < 2) {
      newErrors.prenom = 'Prénom requis (min 2 caractères)';
    }

    if (userData.nom.trim().length < 2) {
      newErrors.nom = 'Nom requis (min 2 caractères)';
    }

    if (!invitedHouseId && !userData.nomMaison.trim()) {
      newErrors.nomMaison = 'Nom de la maison requis';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (userData.password.length < 6) {
      newErrors.password = 'Mot de passe trop court (min 6)';
    }

    if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe diffèrent';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (invitedHouseId) return true;

    const pieceErrors = piecesDetails.map(piece => {
      const err = {};

      if (!piece.nom.trim()) {
        err.nom = 'Nom requis';
      }

      if (!piece.pinLumiere) {
        err.pinLumiere = 'PIN lumière requis';
      }

      if (!piece.pinPorte) {
        err.pinPorte = 'PIN porte requis';
      }

      return err;
    });

    const hasErrors = pieceErrors.some(e => Object.keys(e).length > 0);
    const hasMainDoor = piecesDetails.some(piece => piece.isMainDoor);

    if (hasErrors || !hasMainDoor) {
      setErrors({
        pieces: pieceErrors,
        mainDoor: !hasMainDoor ? 'Sélectionnez la porte principale' : undefined
      });

      return false;
    }

    setErrors({});
    return true;
  };

  const ExecuterInscription = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (invitedHouseId) {
      if (!validateStep1()) return;
    } else {
      if (step === 1) {
        if (validateStep1()) {
          setStep(2);
        }
        return;
      }

      if (!validateStep2()) return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      let finalConfig = [];

      if (!invitedHouseId) {
        finalConfig = piecesDetails.map(piece => ({
          roomName: piece.nom,
          isMainDoor: piece.isMainDoor,
          devices: [
            {
              type: 'LIGHT',
              pin: parseInt(piece.pinLumiere),
              state: 'OFF',
              mainDoor: false
            },
            {
              type: 'DOOR',
              pin: parseInt(piece.pinPorte),
              state: 'CLOSED',
              mainDoor: piece.isMainDoor
            }
          ]
        }));
      }

      const invitedPayload = {
        firstName: userData.prenom.trim(),
        lastName: userData.nom.trim(),
        email: userData.email.trim(),
        password: userData.password
      };

      const ownerPayload = {
        user: {
          firstName: userData.prenom.trim(),
          lastName: userData.nom.trim(),
          email: userData.email.trim(),
          password: userData.password
        },
        house: {
          houseName: userData.nomMaison.trim(),
          rooms: finalConfig.map(room => ({
            name: room.roomName,
            devices: room.devices.map(device => ({
              type: device.type,
              pin: device.pin,
              state: device.state,
              mainDoor: device.mainDoor
            }))
          }))
        }
      };

      const response = await fetch(
        invitedHouseId
          ? `http://localhost:8080/othersUserHouse/requestJoinHouse/${invitedHouseId}`
          : 'http://localhost:8080/users/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(invitedHouseId ? invitedPayload : ownerPayload)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur serveur.');
      }

      const textData = await response.text();
      const data = textData ? JSON.parse(textData) : {};

      if (invitedHouseId) {
        alert("Votre demande a été envoyée. Attendez l'approbation du propriétaire.");
        window.location.href = '/login';
        return;
      }

      sessionStorage.setItem('userProfile', JSON.stringify({
        nom: data.lastName || userData.nom,
        prenom: data.firstName || userData.prenom,
        email: data.email || userData.email,
        nomMaison: data.house?.houseName || userData.nomMaison,
        role: 'admin',
        houseId: data.house?.id || userData.houseId || '1'
      }));

      sessionStorage.setItem('homeConfig', JSON.stringify(finalConfig.map(room => ({
        roomName: room.roomName,
        isMainDoor: room.isMainDoor,
        devices: room.devices.map(device => ({
          type: device.type,
          pin: device.pin,
          state: device.state,
          status: device.state === 'ON' || device.state === 'OPEN',
          mainDoor: device.mainDoor
        }))
      }))));

      window.location.href = '/dashboard';

    } catch (error) {
      console.error('Erreur détaillée :', error);
      setErrors({
        apiError: error.message || 'Impossible de contacter le serveur.'
      });
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
      <div className="register-container" style={{ maxWidth: '550px', width: '100%' }}>
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

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1
              style={{
                fontSize: '2.2rem',
                margin: '0 0 10px 0',
                color: '#1f2937',
                fontWeight: '700'
              }}
            >
              {invitedHouseId
                ? '👋 Rejoindre une maison'
                : step === 1
                  ? '🚀 Créer un compte'
                  : '🏠 Configuration'}
            </h1>

            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>
              {invitedHouseId
                ? 'Votre demande sera envoyée au propriétaire'
                : step === 1
                  ? 'Créez votre compte SmartHome'
                  : 'Configurez vos pièces'}
            </p>

            {!invitedHouseId && (
              <p style={{ color: '#9ca3af', margin: '8px 0 0 0', fontSize: '0.85rem' }}>
                Étape {step} sur 2
              </p>
            )}
          </div>

          {errors.apiError && (
            <div
              style={{
                color: '#dc2626',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                padding: '14px',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '0.9rem',
                marginBottom: '25px',
                fontWeight: '500'
              }}
            >
              {errors.apiError}
            </div>
          )}

          <form onSubmit={ExecuterInscription}>
            {step === 1 ? (
              <div style={{ display: 'grid', gap: '18px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1f2937' }}>
                      Prénom
                    </label>
                    <input
                      name="prenom"
                      placeholder="Jean"
                      value={userData.prenom}
                      onChange={handleUserChange}
                      style={{
                        padding: '11px 14px',
                        border: errors.prenom ? '2px solid #dc2626' : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    />
                    {errors.prenom && (
                      <small style={{ color: '#dc2626', fontSize: '0.8rem' }}>
                        {errors.prenom}
                      </small>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1f2937' }}>
                      Nom
                    </label>
                    <input
                      name="nom"
                      placeholder="Dupont"
                      value={userData.nom}
                      onChange={handleUserChange}
                      style={{
                        padding: '11px 14px',
                        border: errors.nom ? '2px solid #dc2626' : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    />
                    {errors.nom && (
                      <small style={{ color: '#dc2626', fontSize: '0.8rem' }}>
                        {errors.nom}
                      </small>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Mail size={16} /> Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="jean@example.com"
                    value={userData.email}
                    onChange={handleUserChange}
                    style={{
                      padding: '11px 14px',
                      border: errors.email ? '2px solid #dc2626' : '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}
                  />
                  {errors.email && (
                    <small style={{ color: '#dc2626', fontSize: '0.8rem' }}>
                      {errors.email}
                    </small>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Home size={16} /> Nom de la maison
                  </label>

                  {invitedHouseId ? (
                    <div
                      style={{
                        padding: '11px 14px',
                        background: '#f3f4f6',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        color: '#374151',
                        border: '2px solid #e5e7eb'
                      }}
                    >
                      {userData.nomMaison || 'Maison partagée'}
                    </div>
                  ) : (
                    <input
                      name="nomMaison"
                      type="text"
                      placeholder="Ma Villa"
                      value={userData.nomMaison}
                      onChange={handleUserChange}
                      style={{
                        padding: '11px 14px',
                        border: errors.nomMaison ? '2px solid #dc2626' : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    />
                  )}

                  {errors.nomMaison && (
                    <small style={{ color: '#dc2626', fontSize: '0.8rem' }}>
                      {errors.nomMaison}
                    </small>
                  )}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Lock size={16} /> Mot de passe
                    </label>
                    <input
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={userData.password}
                      onChange={handleUserChange}
                      style={{
                        padding: '11px 14px',
                        border: errors.password ? '2px solid #dc2626' : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    />
                    {errors.password && (
                      <small style={{ color: '#dc2626', fontSize: '0.8rem' }}>
                        {errors.password}
                      </small>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1f2937' }}>
                      Confirmer
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={userData.confirmPassword}
                      onChange={handleUserChange}
                      style={{
                        padding: '11px 14px',
                        border: errors.confirmPassword ? '2px solid #dc2626' : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    />
                    {errors.confirmPassword && (
                      <small style={{ color: '#dc2626', fontSize: '0.8rem' }}>
                        {errors.confirmPassword}
                      </small>
                    )}
                  </div>
                </div>

                {!invitedHouseId && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1f2937' }}>
                      Nombre de pièces
                    </label>
                    <input
                      name="nbPieces"
                      type="number"
                      min="1"
                      max="10"
                      value={userData.nbPieces}
                      onChange={handleUserChange}
                      style={{
                        padding: '11px 14px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                )}

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
                  {invitedHouseId ? (
                    <>
                      <UserCheck size={18} /> {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
                    </>
                  ) : (
                    <>
                      <ArrowRight size={18} /> {isSubmitting ? 'Vérification...' : 'Continuer vers les pièces'}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {piecesDetails.map((piece, index) => (
                  <div
                    key={index}
                    style={{
                      background: '#f9fafb',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: '12px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}
                    >
                      Pièce {index + 1}
                    </h3>

                    <div style={{ display: 'grid', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>
                          Nom de la pièce
                        </label>
                        <input
                          placeholder="Salon"
                          value={piece.nom}
                          onChange={(e) => handlePieceChange(index, 'nom', e.target.value)}
                          style={{
                            padding: '10px 12px',
                            border: errors.pieces?.[index]?.nom
                              ? '2px solid #dc2626'
                              : '2px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '0.85rem'
                          }}
                        />
                        {errors.pieces?.[index]?.nom && (
                          <small style={{ color: '#dc2626' }}>
                            {errors.pieces[index].nom}
                          </small>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>
                            PIN lumière
                          </label>
                          <input
                            type="number"
                            placeholder="5"
                            value={piece.pinLumiere}
                            onChange={(e) => handlePieceChange(index, 'pinLumiere', e.target.value)}
                            style={{
                              padding: '10px 12px',
                              border: errors.pieces?.[index]?.pinLumiere
                                ? '2px solid #dc2626'
                                : '2px solid #e5e7eb',
                              borderRadius: '6px',
                              fontSize: '0.85rem'
                            }}
                          />
                          {errors.pieces?.[index]?.pinLumiere && (
                            <small style={{ color: '#dc2626' }}>
                              {errors.pieces[index].pinLumiere}
                            </small>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151' }}>
                            PIN porte
                          </label>
                          <input
                            type="number"
                            placeholder="6"
                            value={piece.pinPorte}
                            onChange={(e) => handlePieceChange(index, 'pinPorte', e.target.value)}
                            style={{
                              padding: '10px 12px',
                              border: errors.pieces?.[index]?.pinPorte
                                ? '2px solid #dc2626'
                                : '2px solid #e5e7eb',
                              borderRadius: '6px',
                              fontSize: '0.85rem'
                            }}
                          />
                          {errors.pieces?.[index]?.pinPorte && (
                            <small style={{ color: '#dc2626' }}>
                              {errors.pieces[index].pinPorte}
                            </small>
                          )}
                        </div>
                      </div>

                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '12px',
                          color: '#374151',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={piece.isMainDoor}
                          onChange={(e) => handlePieceChange(index, 'isMainDoor', e.target.checked)}
                          style={{
                            width: '16px',
                            height: '16px',
                            accentColor: '#667eea'
                          }}
                        />
                        Porte principale
                      </label>
                    </div>
                  </div>
                ))}

                {errors.mainDoor && (
                  <div
                    style={{
                      color: '#dc2626',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      marginTop: '6px'
                    }}
                  >
                    {errors.mainDoor}
                  </div>
                )}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginTop: '10px'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      padding: '12px 16px',
                      background: '#f3f4f6',
                      color: '#374151',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <ArrowLeft size={16} /> Retour
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '12px 16px',
                      background: isSubmitting
                        ? '#9ca3af'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Check size={16} /> {isSubmitting ? 'Inscription...' : 'Finaliser'}
                  </button>
                </div>
              </div>
            )}
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

export default Register;