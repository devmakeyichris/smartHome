
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Mail, Lock, Home, ArrowLeft, ArrowRight, Check, Cpu, DoorOpen, Lightbulb, Link as LinkIcon } from 'lucide-react';
import '../App.css';

const Register = () => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Lecture du houseId dans l'URL (ex: ?houseId=1)
  const query = new URLSearchParams(useLocation().search);
  const invitedHouseId = query.get('houseId');

  const [userData, setUserData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    nomMaison: '',
    houseId: invitedHouseId || '', // Pré-rempli si lien d'invitation
    nbPieces: 1
  });

  const [piecesDetails, setPiecesDetails] = useState([]);

  // Effet pour gérer l'invitation automatique
  useEffect(() => {
    if (invitedHouseId) {
      setUserData(prev => ({
        ...prev,
        nomMaison: "Maison Partagée", // Nom temporaire, sera écrasé par la config réelle
        houseId: invitedHouseId
      }));
    }
  }, [invitedHouseId]);

  useEffect(() => {
    const count = parseInt(userData.nbPieces) || 0;
    const newPieces = Array.from({ length: count }, (_, i) => ({
      id: i,
      nom: piecesDetails[i]?.nom || '',
      pinLumiere: piecesDetails[i]?.pinLumiere || '',
      pinPorte: piecesDetails[i]?.pinPorte || '',
      isMainDoor: piecesDetails[i]?.isMainDoor || false // Initialisation de la porte principale
    }));
    setPiecesDetails(newPieces);
  }, [userData.nbPieces]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handlePieceChange = (index, field, value) => {
    const updatedPieces = [...piecesDetails];
    
    // Si on coche une porte principale, on décoche automatiquement toutes les autres
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
    if (userData.nom.length < 2) newErrors.nom = "Nom requis";
    if (userData.prenom.length < 2) newErrors.prenom = "Prénom requis";
    if (!userData.nomMaison.trim()) newErrors.nomMaison = "Nom de la maison requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) newErrors.email = "Email invalide";
    if (userData.password.length < 6) newErrors.password = "Mot de passe trop court (min 6)";
    if (userData.password !== userData.confirmPassword) newErrors.confirmPassword = "Les mots de passe diffèrent";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (invitedHouseId) return true; // Pas de validation de pièces pour les invités
    
    const newErrors = {};
    const pieceErrors = piecesDetails.map(piece => {
      const err = {};
      if (!piece.nom.trim()) err.nom = "Nom requis";
      if (!piece.pinLumiere) err.pinLumiere = "PIN Lumière requis";
      if (!piece.pinPorte) err.pinPorte = "PIN Porte requis";
      return err;
    });

    const hasErrors = pieceErrors.some(e => Object.keys(e).length > 0);
    if (hasErrors) setErrors({ pieces: pieceErrors });
    return !hasErrors;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Validations de sécurité
    if (invitedHouseId) {
      if (!validateStep1()) return;
    } else {
      if (!validateStep2()) return;
    }

    setIsSubmitting(true);
    try {
      // 1. Préparation de la structure des pièces
      let finalConfig = [];
      if (!invitedHouseId) {
        finalConfig = piecesDetails.map(piece => ({
          roomName: piece.nom,
          isMainDoor: piece.isMainDoor,
          devices: [
            { type: 'light', pin: parseInt(piece.pinLumiere), status: false },
            { type: 'door', pin: parseInt(piece.pinPorte), status: false }
          ]
        }));
      }

      // 2. Formatage des données pour le serveur Spring Boot
      const payload = {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        password: userData.password,
        nomMaison: userData.nomMaison,
        role: invitedHouseId ? 'guest' : 'admin',
        houseId: userData.houseId,
        homeConfig: finalConfig
      };

      // 3. Envoi au serveur Backend (MySQL)
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erreur serveur lors de l'enregistrement du compte");
      }

      const data = await response.json();

      // 4. Initialisation de session uniquement pour le profil actif connecté
      sessionStorage.setItem('userProfile', JSON.stringify({
        nom: data.nom || userData.nom,
        prenom: data.prenom || userData.prenom,
        email: data.email || userData.email,
        nomMaison: data.nomMaison || userData.nomMaison,
        role: invitedHouseId ? 'guest' : 'admin',
        houseId: data.houseId || userData.houseId || "1"
      }));

      if (!invitedHouseId) {
        sessionStorage.setItem('homeConfig', JSON.stringify(data.homeConfig || finalConfig));
      }
      
      // Redirection après succès
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);

    } catch (error) {
      console.error("Erreur d'inscription:", error);
      setErrors({ apiError: "Connexion impossible au serveur d'authentification." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container" style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
      <div className="register-card">
        {!invitedHouseId && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
            <div className={`step-dot ${step === 1 ? 'active' : ''}`} />
            <div className={`step-dot ${step === 2 ? 'active' : ''}`} />
          </div>
        )}

        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>
          {invitedHouseId ? "👋 Rejoindre la maison" : (step === 1 ? "🚀 Création du compte" : "🏠 Configuration des Pièces")}
        </h2>
        
        {errors.apiError && <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.9rem' }}>{errors.apiError}</p>}
        
        {invitedHouseId && (
          <p style={{ textAlign: 'center', color: '#10b981', fontSize: '0.9rem', marginBottom: '20px' }}>
            <LinkIcon size={14} /> ID Maison détecté : <strong>{invitedHouseId}</strong>
          </p>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {step === 1 ? (
            <div className="form-grid" style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label><User size={16} /> Prénom</label>
                  <input name="prenom" value={userData.prenom} onChange={handleUserChange} placeholder="Marie" />
                  {errors.prenom && <span className="error-text">{errors.prenom}</span>}
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Nom</label>
                  <input name="nom" value={userData.nom} onChange={handleUserChange} placeholder="Durand" />
                  {errors.nom && <span className="error-text">{errors.nom}</span>}
                </div>
              </div>

              <div className="input-group">
                <label><Mail size={16} /> Email</label>
                <input name="email" type="email" value={userData.email} onChange={handleUserChange} placeholder="marie@example.com" />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="input-group">
                <label><Home size={16} /> Nom de la Maison</label>
                <input 
                  name="nomMaison" 
                  value={userData.nomMaison} 
                  onChange={handleUserChange} 
                  readOnly={!!invitedHouseId}
                  placeholder="Ex: Ma Villa Connectée" 
                  style={{ background: invitedHouseId ? '#f1f5f9' : 'white' }}
                />
                {invitedHouseId && <small style={{ color: '#64748b' }}>Nom fixé par le propriétaire</small>}
                {errors.nomMaison && <span className="error-text">{errors.nomMaison}</span>}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label><Lock size={16} /> Mot de passe</label>
                  <input name="password" type="password" value={userData.password} onChange={handleUserChange} />
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label><Check size={16} /> Confirmer</label>
                  <input name="confirmPassword" type="password" value={userData.confirmPassword} onChange={handleUserChange} />
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>
              </div>

              {!invitedHouseId && (
                <div className="input-group">
                  <label><Cpu size={16} /> Nombre de pièces à configurer</label>
                  <input name="nbPieces" type="number" min="1" max="10" value={userData.nbPieces} onChange={handleUserChange} />
                </div>
              )}

              {invitedHouseId ? (
                <button type="button" className="cta-button" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Connexion..." : "Rejoindre maintenant"} <Check size={18} />
                </button>
              ) : (
                <button type="button" className="cta-button" onClick={() => validateStep1() && setStep(2)}>
                  Continuer vers les pièces <ArrowRight size={18} />
                </button>
              )}
            </div>
          ) : (
            /* ÉTAPE 2 : CONFIGURATION DES PIÈCES */
            <div className="form-grid" style={{ display: 'grid', gap: '15px' }}>
              {piecesDetails.map((piece, index) => (
                <div key={index} className="piece-setup-row" style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div className="input-group" style={{ marginBottom: '10px' }}>
                    <input 
                      placeholder="Nom de la pièce (ex: Salon)" 
                      value={piece.nom} 
                      onChange={(e) => handlePieceChange(index, 'nom', e.target.value)}
                    />
                    {errors.pieces?.[index]?.nom && <span className="error-text">{errors.pieces[index].nom}</span>}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.7rem' }}><Lightbulb size={12} /> PIN Lumière</label>
                      <input 
                        type="number" placeholder="PIN" 
                        value={piece.pinLumiere} 
                        onChange={(e) => handlePieceChange(index, 'pinLumiere', e.target.value)}
                      />
                      {errors.pieces?.[index]?.pinLumiere && <span className="error-text">{errors.pieces[index].pinLumiere}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.7rem' }}><DoorOpen size={12} /> PIN Porte</label>
                      <input 
                        type="number" placeholder="PIN" 
                        value={piece.pinPorte} 
                        onChange={(e) => handlePieceChange(index, 'pinPorte', e.target.value)}
                      />
                      {errors.pieces?.[index]?.pinPorte && <span className="error-text">{errors.pieces[index].pinPorte}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
                    <input 
                      type="checkbox" 
                      id={`main-door-${index}`} 
                      checked={piece.isMainDoor} 
                      onChange={(e) => handlePieceChange(index, 'isMainDoor', e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor={`main-door-${index}`} style={{ fontSize: '0.8rem', color: '#475569', cursor: 'pointer', fontWeight: '500' }}>
                      🚪 Définir la porte de cette pièce comme porte principale (RFID)
                    </label>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button type="button" className="refresh-btn" onClick={() => setStep(1)} style={{ flex: 1 }}>
                  <ArrowLeft size={18} /> Retour
                </button>
                <button type="button" className="cta-button" onClick={handleSubmit} disabled={isSubmitting} style={{ flex: 2 }}>
                  {isSubmitting ? "Sauvegarde..." : "Finaliser l'installation"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;