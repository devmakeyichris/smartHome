import { useState, useEffect } from 'react';
import { 
  Power, Lightbulb, DoorOpen, Share2, CheckCircle, LogOut, Lock, 
  Pencil, Trash2, Plus, X, Save, CreditCard, ChevronDown, ChevronUp, 
  Radio, Thermometer, Check, Copy, Mail, MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import '../App.css';
import ActivityLog from '../components/ActivityLog';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = 'http://localhost:8080';

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showInviteOptions, setShowInviteOptions] = useState(false);
  const [mainDoorRoom, setMainDoorRoom] = useState(null);
  const [initialMainDoorName, setInitialMainDoorName] = useState(null);

  // États gestion des pièces
  const [editingRoomIdx, setEditingRoomIdx] = useState(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editLightPin, setEditLightPin] = useState('');
  const [editDoorPin, setEditDoorPin] = useState('');
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newLightPin, setNewLightPin] = useState('');
  const [newDoorPin, setNewDoorPin] = useState('');
  const [isMainDoorForNewRoom, setIsMainDoorForNewRoom] = useState(false);

  // États gestion des équipements
  const [addingDeviceRoomIdx, setAddingDeviceRoomIdx] = useState(null);
  const [newDeviceType, setNewDeviceType] = useState('LIGHT');
  const [newDevicePin, setNewDevicePin] = useState('');

  // États gestion des badges RFID
  const [rfidCards, setRfidCards] = useState([]);
  const [newCardName, setNewCardName] = useState('');
  const [newCardBadgeId, setNewCardBadgeId] = useState('');
  
  // État pour la porte principale
  const [mainDoorStatus, setMainDoorStatus] = useState(false);

   const mapHouseToRooms = (house) => {
  return (house.rooms || []).map(room => {
    const devices = (room.devices || []).map(device => ({
      id: device.id,
      type: device.type,
      pin: Number(device.pin),
      state: device.state,
      status: device.state === "ON" || device.state === "OPEN",
      mainDoor: device.mainDoor
    }));

    const light = devices.find(d => d.type === "LIGHT");
    const door = devices.find(d => d.type === "DOOR");

    return {
      id: room.id,
      roomName: room.name,
      lightPin: light ? light.pin : "",
      doorPin: door ? door.pin : null,
      hasMainDoor: devices.some(d => d.type === "DOOR" && d.mainDoor === true),
      devices
    };
  });
};

  // Chargement des données
  useEffect(() => {
  const loadDashboardData = async () => {
    const savedUser = sessionStorage.getItem("userProfile");
    const savedRfidCards = sessionStorage.getItem("rfidCards");

    if (!savedUser) {
      setIsAuthenticated(false);
      return;
    }

    const userData = JSON.parse(savedUser);
    setUser(userData);
    setIsAuthenticated(true);

    if (savedRfidCards) {
      setRfidCards(JSON.parse(savedRfidCards));
    }

    try {
      const response = await fetch(`${API_URL}/users/email/${userData.email}/house`, {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Impossible de charger la maison depuis le backend");
      }

      const house = await response.json();
      const backendRooms = mapHouseToRooms(house);

      setRooms(backendRooms);
      sessionStorage.setItem("homeConfig", JSON.stringify(backendRooms));

      const mainDoor = backendRooms.find(room => room.hasMainDoor === true);
      if (mainDoor) {
        setMainDoorRoom(mainDoor);
        setInitialMainDoorName(mainDoor.roomName);
      }

    } catch (error) {
      console.error("Chargement backend impossible :", error);

      const savedConfig = sessionStorage.getItem("homeConfig");

      if (savedConfig) {
        const loadedRooms = JSON.parse(savedConfig);
        setRooms(loadedRooms);

        const mainDoor = loadedRooms.find(room => room.hasMainDoor === true);
        if (mainDoor) {
          setMainDoorRoom(mainDoor);
          setInitialMainDoorName(mainDoor.roomName);
        }
      } else {
        setRooms([]);
      }
    }
  };

  loadDashboardData();
}, []);

  useEffect(() => {
    if (rfidCards.length > 0) {
      sessionStorage.setItem('rfidCards', JSON.stringify(rfidCards));
    }
  }, [rfidCards]);

  const saveConfigToStorage = (updatedRooms) => {
    setRooms(updatedRooms);
    sessionStorage.setItem('homeConfig', JSON.stringify(updatedRooms));
    
    const mainDoor = updatedRooms.find(room => room.hasMainDoor === true);
    if (mainDoor) {
      setMainDoorRoom(mainDoor);
    }
  };

  const addLog = (action, deviceName, roomName) => {
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newEntry = { action, device: deviceName, room: roomName, time };
    setLogs(prev => [newEntry, ...prev]);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userProfile');
    sessionStorage.removeItem('homeConfig');
    sessionStorage.removeItem('rfidCards');
    window.location.href = '/login';
  };

  const toggleBlockCard = (cardId) => {
    setRfidCards(prev => prev.map(card => {
      if (card.id === cardId) {
        const updatedStatus = !card.isBlocked;
        toast(
          updatedStatus ? `🚫 Badge de ${card.name} bloqué !` : `✅ Badge de ${card.name} débloqué !`,
          { icon: updatedStatus ? '🔒' : '🔓' }
        );
        addLog(updatedStatus ? 'Badge Bloqué' : 'Badge Débloqué', card.name, 'Système RFID');
        return { ...card, isBlocked: updatedStatus };
      }
      return card;
    }));
  };

  const handleAddRfidCard = (e) => {
    e.preventDefault();
    if (!newCardName.trim() || !newCardBadgeId.trim()) {
      toast.error("Veuillez remplir tous les champs !");
      return;
    }

    if (rfidCards.some(c => c.badgeId.toLowerCase() === newCardBadgeId.trim().toLowerCase())) {
      toast.error("Cet ID de badge existe déjà !");
      return;
    }

    const newCard = {
      id: Date.now(),
      name: newCardName.trim(),
      badgeId: newCardBadgeId.trim().toUpperCase(),
      isBlocked: false
    };

    setRfidCards(prev => [...prev, newCard]);
    addLog('Badge Enregistré', newCard.name, 'Système RFID');
    toast.success(`Badge ajouté pour ${newCard.name} !`);
    setNewCardName('');
    setNewCardBadgeId('');
  };

  const triggerRfidScanSimulation = () => {
    if (!mainDoorRoom) {
      toast.error("Aucune porte principale configurée !");
      return;
    }

    if (!mainDoorRoom.doorPin) {
      toast.error("Cette pièce n'a pas de porte configurée !");
      return;
    }

    if (rfidCards.length === 0) {
      toast.error("Aucun badge RFID enregistré. Veuillez d'abord ajouter un badge !");
      return;
    }

    const randomCard = rfidCards[Math.floor(Math.random() * rfidCards.length)];
    
    if (randomCard.isBlocked) {
      toast.error(`🚨 Accès REJETÉ : Le badge de ${randomCard.name} est bloqué !`);
      addLog('Accès Bloqué', randomCard.name, mainDoorRoom.roomName);
      return;
    }

    const confirmed = window.confirm(`🔑 Demande d'accès pour ${randomCard.name} (${randomCard.badgeId})\n\nAutoriser l'accès à ${mainDoorRoom.roomName} ?`);
    
    if (confirmed) {
      toast.success(`✅ Accès accordé à ${randomCard.name} !`);
      addLog('Accès Validé (RFID)', randomCard.name, mainDoorRoom.roomName);
      setMainDoorStatus(true);
      
      const roomIndex = rooms.findIndex(r => r.roomName === mainDoorRoom.roomName);
      if (roomIndex !== -1) {
        const updatedRooms = [...rooms];
        const door = updatedRooms[roomIndex].devices.find(d => d.type === 'DOOR');
        if (door) {
          door.status = true;
          saveConfigToStorage(updatedRooms);
        }
      }
      
      setTimeout(() => {
        setMainDoorStatus(false);
        const roomIndex = rooms.findIndex(r => r.roomName === mainDoorRoom.roomName);
        if (roomIndex !== -1) {
          const updatedRooms = [...rooms];
          const door = updatedRooms[roomIndex].devices.find(d => d.type === 'DOOR');
          if (door) {
            door.status = false;
            saveConfigToStorage(updatedRooms);
          }
        }
      }, 5000);
    } else {
      toast.error(`❌ Accès refusé pour ${randomCard.name}.`);
      addLog('Accès Refusé (RFID)', randomCard.name, mainDoorRoom.roomName);
    }
  };

  const handleAddRoom = (e) => {
    e.preventDefault();
    const name = newRoomName.trim();
    if (!name) {
      toast.error("Veuillez entrer un nom de pièce");
      return;
    }

    if (rooms.some(r => r.roomName.toLowerCase() === name.toLowerCase())) {
      toast.error('Cette pièce existe déjà !');
      return;
    }

    const lightPinNum = parseInt(newLightPin);
    if (isNaN(lightPinNum)) {
      toast.error("Veuillez entrer un PIN valide pour la lumière");
      return;
    }
    
    const doorPinNum = newDoorPin ? parseInt(newDoorPin) : null;

    if (isMainDoorForNewRoom) {
      toast.error(`La porte principale est déjà définie comme "${initialMainDoorName || mainDoorRoom?.roomName}". Vous ne pouvez pas changer la porte principale.`);
      return;
    }

    const newRoom = {
      roomName: name,
      lightPin: lightPinNum,
      doorPin: doorPinNum,
      hasMainDoor: false,
      devices: [
        { type: 'LIGHT', status: false, pin: lightPinNum }
      ]
    };

    if (doorPinNum) {
      newRoom.devices.push({ type: 'DOOR', status: false, pin: doorPinNum });
    }

    const updated = [...rooms, newRoom];
    
    saveConfigToStorage(updated);
    setNewRoomName('');
    setNewLightPin('');
    setNewDoorPin('');
    setIsMainDoorForNewRoom(false);
    setShowAddRoomModal(false);
    addLog('Créée', 'Nouvelle pièce', name);
    toast.success(`Pièce "${name}" ajoutée !`);
  };

  const startEditRoom = (idx, room) => {
    setEditingRoomIdx(idx);
    setEditRoomName(room.roomName);
    setEditLightPin(room.lightPin?.toString() || '');
    setEditDoorPin(room.doorPin?.toString() || '');
  };

  const saveEditRoom = (idx) => {
    const trimmed = editRoomName.trim();
    if (!trimmed) { 
      toast.error('Le nom ne peut pas être vide'); 
      return; 
    }
    
    const lightPinNum = parseInt(editLightPin);
    if (isNaN(lightPinNum)) { 
      toast.error('Le PIN de la lumière est requis'); 
      return; 
    }
    
    const doorPinNum = editDoorPin ? parseInt(editDoorPin) : null;
    
    const newRooms = [...rooms];
    const oldName = newRooms[idx].roomName;
    const wasMainDoor = newRooms[idx].hasMainDoor;
    
    newRooms[idx].roomName = trimmed;
    newRooms[idx].lightPin = lightPinNum;
    newRooms[idx].doorPin = doorPinNum;
    
    newRooms[idx].devices = [];
    newRooms[idx].devices.push({ type: 'LIGHT', status: false, pin: lightPinNum });
    if (doorPinNum) {
      newRooms[idx].devices.push({ type: 'DOOR', status: false, pin: doorPinNum });
    }
    
    newRooms[idx].hasMainDoor = wasMainDoor;
    
    saveConfigToStorage(newRooms);
    setEditingRoomIdx(null);
    addLog('Modifiée', oldName, trimmed);
    toast.success(`Pièce modifiée avec succès`);
  };

  const deleteRoom = (idx) => {
    const targetRoom = rooms[idx];
    
    if (targetRoom.hasMainDoor) {
      toast.error("Impossible de supprimer la porte principale !");
      return;
    }
    
    const newRooms = rooms.filter((_, i) => i !== idx);
    saveConfigToStorage(newRooms);
    setConfirmDeleteIdx(null);
    if (activeFilter === targetRoom.roomName) setActiveFilter('all');
    addLog('Supprimée', 'Pièce entière', targetRoom.roomName);
    toast.success('Pièce supprimée avec tous ses équipements');
  };

 const handleAddDevice = async (e) => {
  e.preventDefault();

  if (!newDevicePin.trim()) {
    toast.error("Veuillez spécifier un PIN");
    return;
  }

  const updatedRooms = [...rooms];
  const room = updatedRooms[addingDeviceRoomIdx];

  if (!room.id) {
    toast.error("Cette pièce n'a pas d'id backend. Recharge la page ou reconnecte-toi.");
    return;
  }

  if (room.devices.some(d => d.type === newDeviceType)) {
    toast.error(`Ce type d'équipement existe déjà dans ${room.roomName}`);
    return;
  }

  const pinNum = Number(newDevicePin);

  const payload = {
    type: newDeviceType,
    pin: pinNum,
    state: newDeviceType === "LIGHT" ? "OFF" : "CLOSED",
    mainDoor: false,
    room: {
      id: room.id
    }
  };

  try {
    const response = await fetch(`${API_URL}/devices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Erreur lors de l'ajout de l'équipement");
    }

    const savedDevice = await response.json();

    room.devices.push({
      id: savedDevice.id,
      type: savedDevice.type,
      pin: Number(savedDevice.pin),
      state: savedDevice.state,
      status: savedDevice.state === "ON" || savedDevice.state === "OPEN",
      mainDoor: savedDevice.mainDoor
    });

    saveConfigToStorage(updatedRooms);

    addLog("Ajouté", `${newDeviceType} PIN ${pinNum}`, room.roomName);
    toast.success(`Équipement ajouté dans ${room.roomName}`);

    setAddingDeviceRoomIdx(null);
    setNewDevicePin("");

  } catch (error) {
    console.error(error);
    toast.error("Équipement non enregistré dans la base");
  }
};

  const handleDeleteDevice = async (roomIdx, deviceType) => {
  const updatedRooms = [...rooms];
  const room = updatedRooms[roomIdx];
  const device = room.devices.find(d => d.type === deviceType);

  if (!device) {
    toast.error("Équipement introuvable");
    return;
  }

  if (!device.id) {
    toast.error("Impossible de supprimer : cet équipement n'a pas d'id backend");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/devices/${device.id}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Erreur suppression");
    }

    room.devices = room.devices.filter(d => d.id !== device.id);

    saveConfigToStorage(updatedRooms);

    addLog("Supprimé", `Équipement ${deviceType}`, room.roomName);
    toast.success(`Équipement retiré de ${room.roomName}`);

  } catch (error) {
    console.error(error);
    toast.error("Suppression non enregistrée dans la base");
  }
};

 const toggleDevice = async (roomIndex, deviceType) => {
  const newRooms = [...rooms];
  const room = newRooms[roomIndex];
  const device = room.devices.find(d => d.type === deviceType);

  if (!device || device.type === "TEMPERATURE") return;

  const nextStatus = !device.status;

  try {
    let arduinoUrl = "";
    let newState = "";

    if (device.type === "LIGHT") {
      newState = nextStatus ? "ON" : "OFF";
      arduinoUrl = `${API_URL}/arduino/light/${device.pin}/${nextStatus ? "on" : "off"}`;
    } else if (device.type === "DOOR") {
      newState = nextStatus ? "OPEN" : "CLOSED";
      arduinoUrl = `${API_URL}/arduino/door/${device.pin}/${nextStatus ? "open" : "close"}`;
    }

    const arduinoResponse = await fetch(arduinoUrl, {
      method: "POST",
      credentials: "include"
    });

    if (!arduinoResponse.ok) {
      const errorText = await arduinoResponse.text();
      throw new Error(errorText || "Erreur Arduino");
    }

    if (device.id) {
      await fetch(`${API_URL}/devices/${device.id}/state?state=${newState}`, {
        method: "PUT",
        credentials: "include"
      });
    }

    device.status = nextStatus;
    device.state = newState;

    saveConfigToStorage(newRooms);

    const actionName = device.status
      ? (device.type === "LIGHT" ? "Allumée" : "Ouverte")
      : (device.type === "LIGHT" ? "Éteinte" : "Fermée");

    const deviceLabel = device.type === "LIGHT" ? "Lumière" : "Porte";

    addLog(actionName, deviceLabel, room.roomName);
    toast.success(`${deviceLabel} ${actionName.toLowerCase()} dans ${room.roomName}`);

  } catch (error) {
    console.error(error);
    toast.error("Commande non envoyée à l'Arduino");
  }
};

  const inviteLink = `${window.location.origin}/register?houseId=${user?.houseId || '1'}`;
  const inviteMessage = `Rejoins ma maison connectée sur SmartHome ! Voici ton lien d'accès : ${inviteLink}`;

  const handleShareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(inviteMessage)}`;
    window.open(whatsappUrl, '_blank');
    addLog('Invitation envoyée', 'WhatsApp', 'Système');
    toast.success("Ouverture de WhatsApp...");
    setShowInviteOptions(false);
  };

  const handleShareViaEmail = () => {
    const emailUrl = `mailto:?subject=Invitation à rejoindre ma maison connectée&body=${encodeURIComponent(inviteMessage)}`;
    window.open(emailUrl, '_blank');
    addLog('Invitation envoyée', 'Email', 'Système');
    toast.success("Ouverture de votre client email...");
    setShowInviteOptions(false);
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Lien d'invitation copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredRooms = activeFilter === 'all' ? rooms : rooms.filter(room => room.roomName === activeFilter);
  const totalRooms = rooms.length;
  const totalLightsOn = rooms.reduce((t, r) => t + r.devices.filter(d => d.type === 'LIGHT' && d.status).length, 0);
  const totalDoorsOpen = rooms.reduce((t, r) => t + r.devices.filter(d => d.type === 'DOOR' && d.status).length, 0);

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="register-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <Lock size={60} style={{ color: '#667eea', margin: '0 auto 20px' }} />
          <h2>Accès Réservé</h2>
          <Link to="/login" className="btn-primary" style={{ display: 'block', marginTop: '15px', textDecoration: 'none', textAlign: 'center' }}>Se connecter</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Toaster position="top-right" />

      <header className="dashboard-header">
        <div>
          <p className="dashboard-subtitle">Tableau de bord</p>
          <h1 className="dashboard-title">Bienvenue, {user?.prenom || 'Propriétaire'} !</h1>
        </div>
        <div className="dashboard-actions">
          <button className="btn-primary" onClick={() => setShowAddRoomModal(true)} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <Plus size={18} /> Ajouter une pièce
          </button>
          <button className="btn-primary" onClick={() => setShowInviteOptions(true)}>
            <Share2 size={18} /> Inviter
          </button>
          <button className="btn-secondary" onClick={handleLogout}>
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </header>

      {/* MODAL INVITATION AVEC LIEN CLIQUABLE */}
      {showInviteOptions && (
        <div className="invite-overlay" onClick={() => setShowInviteOptions(false)}>
          <div className="invite-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="invite-modal-header">
              <h3>Inviter un membre</h3>
              <button className="modal-close" onClick={() => setShowInviteOptions(false)}>×</button>
            </div>
            <div className="invite-modal-body">
              <p style={{ marginBottom: '15px', color: '#666' }}>Choisissez comment envoyer l'invitation :</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  onClick={handleShareViaWhatsApp}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    background: '#25D366',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  <MessageCircle size={20} /> Partager via WhatsApp
                </button>
                
                <button 
                  onClick={handleShareViaEmail}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    background: '#EA4335',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem'
                  }}
                >
                  <Mail size={20} /> Partager via Email
                </button>
                
                <div style={{ marginTop: '10px', borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                  <label style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px', display: 'block' }}>
                    Ou copier le lien d'invitation :
                  </label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input 
                      type="text" 
                      readOnly 
                      value={inviteLink} 
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem', background: '#f9fafb' }} 
                    />
                    <button 
                      onClick={handleCopyInviteLink} 
                      style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'Copié !' : 'Copier'}
                    </button>
                  </div>
                  
                  {/* LIEN CLIQUABLE */}
                  <div style={{ marginTop: '15px', padding: '12px', background: '#f0f4ff', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#666' }}>🔗 Lien direct (cliquable) :</p>
                    <a 
                      href={inviteLink} 
                      target="_blank" 
                  rel="noopener noreferrer"
                      style={{ 
                        color: '#667eea', 
                        textDecoration: 'underline',
                        wordBreak: 'break-all',
                        fontSize: '0.85rem',
                        display: 'inline-block'
                      }}
                    >
                      {inviteLink}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUT PIECE */}
      {showAddRoomModal && (
        <div className="invite-overlay" onClick={() => setShowAddRoomModal(false)}>
          <div className="invite-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="invite-modal-header">
              <h3>Ajouter une nouvelle pièce</h3>
              <button className="modal-close" onClick={() => setShowAddRoomModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddRoom} style={{ display: 'grid', gap: '15px', marginTop: '10px' }}>
              <input 
                type="text" 
                placeholder="Nom de la pièce" 
                value={newRoomName} 
                onChange={e => setNewRoomName(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} 
              />
              <input 
                type="number" 
                placeholder="PIN de la lumière" 
                value={newLightPin} 
                onChange={e => setNewLightPin(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} 
              />
              <input 
                type="number" 
                placeholder="PIN de la porte (optionnel)" 
                value={newDoorPin} 
                onChange={e => setNewDoorPin(e.target.value)} 
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} 
              />
              <div style={{ 
                background: '#fef3c7', 
                padding: '10px', 
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: '#92400e'
              }}>
                ⚠️ La porte principale est déjà définie comme "{initialMainDoorName || mainDoorRoom?.roomName || 'salon'}"
              </div>
              <button type="submit" className="btn-primary">Créer la pièce</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AJOUT EQUIPEMENT */}
      {addingDeviceRoomIdx !== null && (
        <div className="invite-overlay" onClick={() => setAddingDeviceRoomIdx(null)}>
          <div className="invite-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="invite-modal-header">
              <h3>Ajouter un équipement</h3>
              <button className="modal-close" onClick={() => setAddingDeviceRoomIdx(null)}>×</button>
            </div>
            <form onSubmit={handleAddDevice} style={{ display: 'grid', gap: '15px', marginTop: '10px' }}>
              <select value={newDeviceType} onChange={e => setNewDeviceType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px' }}>
                <option value="LIGHT">💡 Lumière</option>
                <option value="DOOR">🚪 Porte</option>
                <option value="TEMPERATURE">🌡️ Capteur Température</option>
              </select>
              <input type="number" placeholder="PIN Matériel" value={newDevicePin} onChange={e => setNewDevicePin(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              <button type="submit" className="btn-primary">Confirmer l'ajout</button>
            </form>
          </div>
        </div>
      )}

      {/* CARDS RESUME */}
      <div className="dashboard-summary">
        <div className="metric-card">
          <h2>{user?.nomMaison || 'chez moi'}</h2>
          <span>{totalRooms} pièces</span>
        </div>
        <div className="metric-card">
          <h2>{totalLightsOn}</h2>
          <span>Lumières allumées</span>
        </div>
        <div className="metric-card">
          <h2>{totalDoorsOpen}</h2>
          <span>Portes ouvertes</span>
        </div>
      </div>

      {/* PORTE PRINCIPALE */}
      {mainDoorRoom && mainDoorRoom.doorPin && (
        <div className="main-door-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '20px', marginBottom: '24px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DoorOpen size={24} /> Porte Principale - {mainDoorRoom.roomName}
              </h2>
              <p style={{ margin: '5px 0 0', opacity: 0.9 }}>
                PIN: {mainDoorRoom.doorPin} • 
                Statut: {mainDoorStatus || (mainDoorRoom.devices.find(d => d.type === 'DOOR')?.status) ? '🟢 OUVERTE' : '🔒 FERMÉE'}
              </p>
            </div>
            <button 
              onClick={triggerRfidScanSimulation}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CreditCard size={18} /> Scanner un badge RFID
            </button>
          </div>
        </div>
      )}

      {/* FILTRES */}
      <div className="room-filter-nav">
        <button onClick={() => setActiveFilter('all')} className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}>
          Toute la maison
        </button>
        {rooms.map((room, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveFilter(room.roomName)} 
            className={`filter-btn ${activeFilter === room.roomName ? 'active' : ''}`}
          >
            {room.roomName} {room.hasMainDoor && '🏠'}
          </button>
        ))}
      </div>

      {/* GRILLE PRINCIPALE */}
      <div className="dashboard-grid">
        
        <div className="room-list">
          {filteredRooms.map((room) => {
            const realIdx = rooms.findIndex(r => r.roomName === room.roomName);
            const isEditing = editingRoomIdx === realIdx;
            const isMainDoor = room.hasMainDoor === true;

            return (
              <div 
                key={realIdx} 
                className="room-card" 
                style={isMainDoor ? { 
                  border: '3px solid #667eea', 
                  backgroundColor: '#f0f4ff',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                } : {}}
              >
                <div className="room-card-header">
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <input 
                        value={editRoomName} 
                        onChange={e => setEditRoomName(e.target.value)} 
                        placeholder="Nom de la pièce"
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }} 
                      />
                      <input 
                        value={editLightPin} 
                        onChange={e => setEditLightPin(e.target.value)} 
                        placeholder="PIN Lumière"
                        type="number"
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }} 
                      />
                      <input 
                        value={editDoorPin} 
                        onChange={e => setEditDoorPin(e.target.value)} 
                        placeholder="PIN Porte (optionnel)"
                        type="number"
                        style={{ padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }} 
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => saveEditRoom(realIdx)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                          <Save size={16} /> Sauvegarder
                        </button>
                        <button onClick={() => setEditingRoomIdx(null)} style={{ background: '#6b7280', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                          <X size={16} /> Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h2 style={{ margin: 0 }}>{room.roomName}</h2>
                          {isMainDoor && (
                            <span style={{ 
                              background: '#667eea', 
                              color: 'white', 
                              padding: '4px 12px', 
                              borderRadius: '20px', 
                              fontSize: '0.7rem', 
                              fontWeight: '600',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <DoorOpen size={12} /> PORTE PRINCIPALE
                            </span>
                          )}
                        </div>
                        {isMainDoor && (
                          <small style={{ color: '#667eea', display: 'block', marginTop: '4px' }}>
                            🔑 Utilisez le badge RFID pour accéder à cette porte
                          </small>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => startEditRoom(realIdx, room)} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer' }}>
                          <Pencil size={15} /> Modifier
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteIdx(realIdx)} 
                          style={{ background: 'none', border: 'none', color: isMainDoor ? '#9ca3af' : '#ef4444', cursor: isMainDoor ? 'not-allowed' : 'pointer' }} 
                          disabled={isMainDoor}
                        >
                          <Trash2 size={15} /> Supprimer
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {confirmDeleteIdx === realIdx && !isMainDoor && (
                  <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#b91c1c' }}>⚠️ Supprimer définitivement cette pièce ?</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => deleteRoom(realIdx)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 12px', cursor: 'pointer' }}>Oui</button>
                      <button onClick={() => setConfirmDeleteIdx(null)} style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 12px', cursor: 'pointer' }}>Non</button>
                    </div>
                  </div>
                )}

                <div className="room-devices">
                  {room.devices.map((device) => {
                    const isOn = device.status;
                    return (
                      <div key={device.type} className="device-line" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed #e5e7eb' }}>
                        <div>
                          <div>
                            <strong>
                              {device.type === 'LIGHT' ? '💡 Lumière' : device.type === 'DOOR' ? '🚪 Porte' : '🌡️ Température'}
                            </strong>
                            {isMainDoor && device.type === 'DOOR' && (
                              <span style={{ marginLeft: '8px', fontSize: '0.7rem', background: '#667eea20', color: '#667eea', padding: '2px 6px', borderRadius: '12px' }}>
                                RFID
                              </span>
                            )}
                          </div>
                          <small style={{ color: '#9ca3af' }}>PIN {device.pin}</small>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {device.type === 'TEMPERATURE' ? (
                            <span style={{ color: '#ef4444', fontWeight: '700' }}>24°C</span>
                          ) : (
                            <button 
                              onClick={() => toggleDevice(realIdx, device.type)} 
                              style={{ 
                                background: isOn ? '#10b981' : '#d1d5db', 
                                color: 'white', 
                                border: 'none', 
                                padding: '4px 12px', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              {isOn ? 'ON' : 'OFF'}
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteDevice(realIdx, device.type)} 
                            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '20px' }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '10px' }}>
                  <button 
                    onClick={() => setAddingDeviceRoomIdx(realIdx)} 
                    style={{ width: '100%', padding: '8px', fontSize: '0.85rem', cursor: 'pointer', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  >
                    ＋ Ajouter un équipement
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="room-card" style={{ background: '#ffffff', padding: '20px', borderRadius: '12px' }}>
            <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '10px', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard style={{ color: '#667eea' }} /> Gestion Globale RFID
              </h2>
              <small style={{ color: '#6b7280' }}>
                Gérez les badges d'accès à la porte principale 
                <strong style={{ color: '#667eea' }}> ({mainDoorRoom?.roomName || initialMainDoorName || 'salon'})</strong>
              </small>
            </div>

            <form onSubmit={handleAddRfidCard} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '0.9rem', margin: '0 0 10px 0', color: '#374151' }}>Ajouter un nouveau badge :</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Nom du propriétaire" 
                  value={newCardName} 
                  onChange={e => setNewCardName(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', fontSize: '0.9rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                />
                <input 
                  type="text" 
                  placeholder="Code RFID (ex: RFID-1234)" 
                  value={newCardBadgeId} 
                  onChange={e => setNewCardBadgeId(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', fontSize: '0.9rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                />
                <button type="submit" style={{ background: '#667eea', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>
                  ➕ Ajouter le badge
                </button>
              </div>
            </form>

            <div>
              <h3 style={{ fontSize: '0.9rem', margin: '0 0 10px 0', color: '#374151' }}>
                Badges enregistrés : {rfidCards.length === 0 && <span style={{ fontWeight: 'normal', color: '#9ca3af' }}>(Aucun badge)</span>}
              </h3>
              {rfidCards.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', background: '#f9fafb', borderRadius: '8px', color: '#9ca3af' }}>
                  <CreditCard size={40} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <p>Aucun badge enregistré</p>
                  <small>Utilisez le formulaire ci-dessus pour ajouter des badges RFID</small>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {rfidCards.map(card => (
                    <div key={card.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '10px 12px', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb', 
                      background: card.isBlocked ? '#fef2f2' : '#ffffff' 
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', color: card.isBlocked ? '#991b1b' : '#1f2937', fontSize: '0.9rem' }}>
                          👤 {card.name} 
                          {card.isBlocked && <span style={{ fontSize: '0.7rem', background: '#fecaca', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>BLOQUÉ</span>}
                        </div>
                        <code style={{ fontSize: '0.75rem', color: '#64748b' }}>🏷️ {card.badgeId}</code>
                      </div>
                      <button 
                        onClick={() => toggleBlockCard(card.id)} 
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '0.75rem', 
                          fontWeight: '600', 
                          borderRadius: '6px', 
                          cursor: 'pointer', 
                          border: 'none',
                          background: card.isBlocked ? '#10b981' : '#ef4444',
                          color: 'white'
                        }}
                      >
                        {card.isBlocked ? '🔓 Débloquer' : '🔒 Bloquer'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <ActivityLog logs={logs} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;