import { useState, useEffect } from 'react';
import {
  DoorOpen,
  Share2,
  LogOut,
  Lock,
  Pencil,
  Trash2,
  Plus,
  X,
  Save,
  CreditCard,
  Check,
  Copy,
  Mail,
  MessageCircle
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
  const [mainDoorStatus, setMainDoorStatus] = useState(false);
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [inviteLink, setInviteLink] = useState('');
  
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
  
  const [addingDeviceRoomIdx, setAddingDeviceRoomIdx] = useState(null);
  const [newDeviceType, setNewDeviceType] = useState('LIGHT');
  const [newDevicePin, setNewDevicePin] = useState('');
  
  const [rfidCards, setRfidCards] = useState([]);
  const [newCardName, setNewCardName] = useState('');
  const [newCardBadgeId, setNewCardBadgeId] = useState('');
  
  const mapHouseToRooms = (house) => {
    return (house.rooms || []).map(room => {
      const devices = (room.devices || []).map(device => ({
        id: device.id,
        type: device.type,
        pin: Number(device.pin),
        state: device.state,
        status: device.state === 'ON' || device.state === 'OPEN',
        mainDoor: device.mainDoor === true
      }));
      
      const light = devices.find(d => d.type === 'LIGHT');
      const door = devices.find(d => d.type === 'DOOR');
      
      return {
        id: room.id,
        roomName: room.name,
        lightPin: light ? light.pin : '',
        doorPin: door ? door.pin : null,
        hasMainDoor: devices.some(d => d.type === 'DOOR' && d.mainDoor === true),
        devices
      };
    });
  };
  
  const loadPendingRequests = async (userData = user) => {
    const houseId = Number(
      userData?.houseId ||
      sessionStorage.getItem("houseId")
    );
    
    if (!houseId) {
      console.warn("Impossible de charger les demandes : houseId introuvable");
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/othersUserHouse/pending/${houseId}`, {
        method: "GET",
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Impossible de charger les demandes");
      }
      
      const data = await response.json();
      setPendingRequests(data);
      
    } catch (error) {
      console.error("Erreur chargement demandes :", error);
    }
  };
  
  const handleApproveRequest = async (requestId, approved) => {
    try {
      const response = await fetch(
        `${API_URL}/othersUserHouse/approveJoinRequest/${requestId}?approved=${approved}`,
        {
          method: "POST",
          credentials: "include"
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Impossible de traiter la demande");
      }
      
      setPendingRequests(prev =>
        prev.filter(request => request.id !== requestId)
      );
      
      toast.success(
        approved
        ? "Demande approuvée avec succès"
        : "Demande refusée"
      );
      
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du traitement de la demande");
    }
  };
  
  const getCurrentHouseId = (userData = user) => {
    const storedUser = JSON.parse(sessionStorage.getItem('userProfile') || '{}');
    const storedHouseId = sessionStorage.getItem('houseId');
    
    return Number(
      userData?.houseId ||
      userData?.house?.id ||
      storedUser?.houseId ||
      storedUser?.house?.id ||
      storedHouseId
    );
  };
  
  const saveConfigToStorage = (updatedRooms) => {
    setRooms(updatedRooms);
    sessionStorage.setItem('homeConfig', JSON.stringify(updatedRooms));
    
    const mainDoor = updatedRooms.find(room => room.hasMainDoor === true);
    if (mainDoor) {
      setMainDoorRoom(mainDoor);
      setInitialMainDoorName(mainDoor.roomName);
      
      const door = mainDoor.devices.find(device => device.type === 'DOOR');
      setMainDoorStatus(door?.status === true);
    } else {
      setMainDoorRoom(null);
      setMainDoorStatus(false);
    }
  };
  
  const addLog = (action, deviceName, roomName) => {
    const time = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const newEntry = {
      action,
      device: deviceName,
      room: roomName,
      time
    };
    
    setLogs(prev => [newEntry, ...prev]);
  };
  
  const loadRfidCardsFromBackend = async (userData = user) => {
    const houseId = getCurrentHouseId(userData);
    
    if (!houseId) {
      console.warn('Impossible de charger les badges RFID : houseId introuvable');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/rfid/all`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Impossible de charger les badges RFID');
      }
      
      const data = await response.json();
      
      const cardsForThisHouse = data
      .filter(card => Number(card.houseId) === houseId)
      .map(card => ({
        id: card.id,
        name: card.name,
        badgeId: card.uid,
        uid: card.uid,
        houseId: card.houseId,
        isBlocked: card.active === false
      }));
      
      setRfidCards(cardsForThisHouse);
      sessionStorage.setItem('rfidCards', JSON.stringify(cardsForThisHouse));
    } catch (error) {
      console.error(error);
      toast.error('Impossible de charger les badges RFID depuis la base');
    }
  };
  
  const loadPendingRequests = async (userData = user) => {
    const houseId = getCurrentHouseId(userData);
    
    if (!houseId) {
      console.warn('Impossible de charger les demandes : houseId introuvable');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/othersUserHouse/pending/${houseId}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Impossible de charger les demandes');
      }
      
      const data = await response.json();
      setPendingRequests(data);
    } catch (error) {
      console.error('Erreur chargement demandes :', error);
    }
  };
  
  const handleApproveRequest = async (requestId, approved) => {
    try {
      const response = await fetch(
        `${API_URL}/othersUserHouse/approveJoinRequest/${requestId}?approved=${approved}`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Impossible de traiter la demande');
      }
      
      setPendingRequests(prev => prev.filter(request => request.id !== requestId));
      
      toast.success(
        approved
        ? 'Demande approuvée avec succès'
        : 'Demande refusée'
      );
      
      addLog(
        approved ? 'Invitation approuvée' : 'Invitation refusée',
        `Demande ${requestId}`,
        'Système'
      );
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du traitement de la demande');
    }
  };
  
  const generateInvitationLink = async () => {
    const houseId = getCurrentHouseId();
    
    if (!houseId) {
      toast.error("Maison introuvable : impossible de générer l'invitation");
      return null;
    }
    
    try {
      const response = await fetch(`${API_URL}/invitations/house/${houseId}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur génération invitation');
      }
      
      const data = await response.json();
      
      setInviteLink(data.invitationLink);
      return data.invitationLink;
    } catch (error) {
      console.error(error);
      toast.error("Impossible de générer le lien d'invitation");
      return null;
    }
  };
  
  const loadDashboardData = async () => {
    const savedUser = sessionStorage.getItem('userProfile');
    
    if (!savedUser) {
      setIsAuthenticated(false);
      return;
    }
    
    const userData = JSON.parse(savedUser);
    
    setUser(userData);
    setIsAuthenticated(true);
    
    try {
      const response = await fetch(`${API_URL}/users/email/${userData.email}/house`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Impossible de charger la maison depuis le backend');
      }
      
      const house = await response.json();
      
      const updatedUser = {
        ...userData,
        houseId: house.id,
        nomMaison: house.houseName || userData.nomMaison
      };
      
      setUser(updatedUser);
      sessionStorage.setItem("userProfile", JSON.stringify(updatedUser));
      sessionStorage.setItem("houseId", house.id);
      
      const backendRooms = mapHouseToRooms(house);
      saveConfigToStorage(backendRooms);
      
      await loadRfidCardsFromBackend(updatedUser);
      await loadPendingRequests(updatedUser);
      
      setUser(updatedUser);
      sessionStorage.setItem('userProfile', JSON.stringify(updatedUser));
      sessionStorage.setItem('houseId', house.id);
      
      const backendRooms = mapHouseToRooms(house);
      saveConfigToStorage(backendRooms);
      
      await loadRfidCardsFromBackend(updatedUser);
      await loadPendingRequests(updatedUser);
    } catch (error) {
      console.error('Chargement backend impossible :', error);
      
      const savedConfig = sessionStorage.getItem('homeConfig');
      const savedRfidCards = sessionStorage.getItem('rfidCards');
      
      if (savedConfig) {
        const loadedRooms = JSON.parse(savedConfig);
        saveConfigToStorage(loadedRooms);
      } else {
        setRooms([]);
      }
      
      if (savedRfidCards) {
        setRfidCards(JSON.parse(savedRfidCards));
      }
      
      await loadPendingRequests(userData);
    }
  };
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  useEffect(() => {
    if (rfidCards.length > 0) {
      sessionStorage.setItem('rfidCards', JSON.stringify(rfidCards));
    }
  }, [rfidCards]);
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/arduino/states`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) return;
        
        const states = await response.json();
        
        setRooms(prevRooms => {
          let changed = false;
          
          const updatedRooms = prevRooms.map(room => {
            const updatedDevices = room.devices.map(device => {
              const key = `${device.type}:${device.pin}`;
              const arduinoState = states[key];
              
              if (!arduinoState) {
                return device;
              }
              
              const newStatus =
              arduinoState === 'ON' ||
              arduinoState === 'OPEN';
              
              if (device.status === newStatus && device.state === arduinoState) {
                return device;
              }
              
              changed = true;
              
              return {
                ...device,
                status: newStatus,
                state: arduinoState
              };
            });
            
            return {
              ...room,
              devices: updatedDevices
            };
          });
          
          if (!changed) {
            return prevRooms;
          }
          
          sessionStorage.setItem('homeConfig', JSON.stringify(updatedRooms));
          
          const mainDoor = updatedRooms.find(room =>
            room.devices.some(device =>
              device.type === 'DOOR' &&
              device.mainDoor === true
            )
          );
          
          if (mainDoor) {
            const door = mainDoor.devices.find(device => device.type === 'DOOR');
            setMainDoorRoom(mainDoor);
            setMainDoorStatus(door?.status === true);
          }
          
          return updatedRooms;
        });
      } catch (error) {
        console.warn('Impossible de synchroniser les états Arduino :', error);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);
  
  const handleLogout = () => {
    sessionStorage.removeItem('userProfile');
    sessionStorage.removeItem('homeConfig');
    sessionStorage.removeItem('rfidCards');
    sessionStorage.removeItem('houseId');
    window.location.href = '/login';
  };
  
  const toggleBlockCard = async (cardId) => {
    const card = rfidCards.find(c => c.id === cardId);
    
    if (!card) {
      toast.error('Badge introuvable');
      return;
    }
    
    const url = card.isBlocked
    ? `${API_URL}/rfid/${cardId}/unblock`
    : `${API_URL}/rfid/${cardId}/block`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors du changement d'état du badge");
      }
      
      const updatedCardFromBackend = await response.json();
      
      const updatedCards = rfidCards.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            isBlocked: updatedCardFromBackend.active === false
          };
        }
        
        return c;
      });
      
      setRfidCards(updatedCards);
      sessionStorage.setItem('rfidCards', JSON.stringify(updatedCards));
      
      const isNowBlocked = updatedCardFromBackend.active === false;
      
      toast(
        isNowBlocked
        ? `Badge de ${card.name} bloqué !`
        : `Badge de ${card.name} débloqué !`
      );
      
      addLog(
        isNowBlocked ? 'Badge bloqué' : 'Badge débloqué',
        card.name,
        'Système RFID'
      );
    } catch (error) {
      console.error(error);
      toast.error('Modification du badge non enregistrée en base');
    }
  };
  
  const handleAddRfidCard = async (e) => {
    e.preventDefault();
    
    if (!newCardName.trim() || !newCardBadgeId.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    const uid = newCardBadgeId.trim().replace(/\s/g, '').toUpperCase();
    const houseId = getCurrentHouseId();
    
    if (!houseId) {
      toast.error("Impossible d'ajouter le badge : maison introuvable");
      return;
    }
    
    if (rfidCards.some(c => (c.uid || c.badgeId).toUpperCase() === uid)) {
      toast.error('Cet ID de badge existe déjà');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/rfid/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          uid,
          name: newCardName.trim(),
          houseId
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de l'enregistrement du badge");
      }
      
      const savedCard = await response.json();
      
      const newCard = {
        id: savedCard.id,
        name: savedCard.name,
        badgeId: savedCard.uid,
        uid: savedCard.uid,
        houseId: savedCard.houseId,
        isBlocked: savedCard.active === false
      };
      
      const updatedCards = [...rfidCards, newCard];
      
      setRfidCards(updatedCards);
      sessionStorage.setItem('rfidCards', JSON.stringify(updatedCards));
      
      addLog('Badge enregistré', newCard.name, 'Système RFID');
      toast.success(`Badge ajouté pour ${newCard.name}`);
      
      setNewCardName('');
      setNewCardBadgeId('');
    } catch (error) {
      console.error(error);
      toast.error('Badge non enregistré dans la base de données');
    }
  };
  
  const handleAddRoom = (e) => {
    e.preventDefault();
    
    toast.error("L'ajout de pièce doit être relié au backend avant utilisation.");
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
    
    const newRooms = [...rooms];
    const oldName = newRooms[idx].roomName;
    
    newRooms[idx] = {
      ...newRooms[idx],
      roomName: trimmed,
      lightPin: editLightPin ? Number(editLightPin) : newRooms[idx].lightPin,
      doorPin: editDoorPin ? Number(editDoorPin) : newRooms[idx].doorPin
    };
    
    saveConfigToStorage(newRooms);
    setEditingRoomIdx(null);
    addLog('Modifiée', oldName, trimmed);
    toast.success('Pièce modifiée localement');
  };
  
  const deleteRoom = () => {
    toast.error("La suppression de pièce doit être reliée au backend avant utilisation.");
  };
  
  const handleAddDevice = async (e) => {
    e.preventDefault();
    
    if (!newDevicePin.trim()) {
      toast.error('Veuillez spécifier un PIN');
      return;
    }
    
    const updatedRooms = [...rooms];
    const room = updatedRooms[addingDeviceRoomIdx];
    
    if (!room?.id) {
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
      state: newDeviceType === 'LIGHT' ? 'OFF' : 'CLOSED',
      mainDoor: false,
      room: {
        id: room.id
      }
    };
    
    try {
      const response = await fetch(`${API_URL}/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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
        status: savedDevice.state === 'ON' || savedDevice.state === 'OPEN',
        mainDoor: savedDevice.mainDoor === true
      });
      
      saveConfigToStorage(updatedRooms);
      
      addLog('Ajouté', `${newDeviceType} PIN ${pinNum}`, room.roomName);
      toast.success(`Équipement ajouté dans ${room.roomName}`);
      
      setAddingDeviceRoomIdx(null);
      setNewDevicePin('');
    } catch (error) {
      console.error(error);
      toast.error('Équipement non enregistré dans la base');
    }
  };
  
  const handleDeleteDevice = async (roomIdx, deviceType) => {
    const updatedRooms = [...rooms];
    const room = updatedRooms[roomIdx];
    const device = room.devices.find(d => d.type === deviceType);
    
    if (!device) {
      toast.error('Équipement introuvable');
      return;
    }
    
    if (!device.id) {
      toast.error("Impossible de supprimer : cet équipement n'a pas d'id backend");
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/devices/${device.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur suppression');
      }
      
      room.devices = room.devices.filter(d => d.id !== device.id);
      
      saveConfigToStorage(updatedRooms);
      
      addLog('Supprimé', `Équipement ${deviceType}`, room.roomName);
      toast.success(`Équipement retiré de ${room.roomName}`);
    } catch (error) {
      console.error(error);
      toast.error('Suppression non enregistrée dans la base');
    }
  };
  
  const toggleDevice = async (roomIndex, deviceType) => {
    const newRooms = [...rooms];
    const room = newRooms[roomIndex];
    const device = room.devices.find(d => d.type === deviceType);
    
    if (!device || device.type === 'TEMPERATURE') return;
    
    const nextStatus = !device.status;
    
    let arduinoUrl = '';
    let newState = '';
    
    if (device.type === 'LIGHT') {
      newState = nextStatus ? 'ON' : 'OFF';
      arduinoUrl = `${API_URL}/arduino/light/${device.pin}/${nextStatus ? 'on' : 'off'}`;
    }
    
    if (device.type === 'DOOR') {
      newState = nextStatus ? 'OPEN' : 'CLOSED';
      arduinoUrl = `${API_URL}/arduino/door/${device.pin}/${nextStatus ? 'open' : 'close'}`;
    }
    
    try {
      const arduinoResponse = await fetch(arduinoUrl, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!arduinoResponse.ok) {
        const errorText = await arduinoResponse.text();
        throw new Error(errorText || 'Erreur Arduino');
      }
      
      if (device.id) {
        try {
          const stateResponse = await fetch(`${API_URL}/devices/${device.id}/state?state=${newState}`, {
            method: 'PUT',
            credentials: 'include'
          });
          
          if (!stateResponse.ok) {
            console.warn("État non sauvegardé en base, mais Arduino a reçu la commande.");
          }
        } catch (error) {
          console.warn('Erreur sauvegarde état device :', error);
        }
      }
      
      device.status = nextStatus;
      device.state = newState;
      
      saveConfigToStorage(newRooms);
      
      const actionName = device.status
      ? (device.type === 'LIGHT' ? 'Allumée' : 'Ouverte')
      : (device.type === 'LIGHT' ? 'Éteinte' : 'Fermée');
      
      const deviceLabel = device.type === 'LIGHT' ? 'Lumière' : 'Porte';
      
      addLog(actionName, deviceLabel, room.roomName);
      toast.success(`${deviceLabel} ${actionName.toLowerCase()} dans ${room.roomName}`);
    } catch (error) {
      console.error(error);
      toast.error("Commande non envoyée à l'Arduino");
    }
  };
  
  const handleShareViaWhatsApp = () => {
    if (!inviteLink) {
      toast.error("Génère d'abord un lien d'invitation");
      return;
    }
    
    const message = `Rejoins ma maison connectée sur SmartHome ! Voici ton lien d'accès : ${inviteLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    addLog('Invitation envoyée', 'WhatsApp', 'Système');
    toast.success('Ouverture de WhatsApp...');
    setShowInviteOptions(false);
  };
  
  
  const handleShareViaEmail = () => {
    if (!inviteLink) {
      toast.error("Génère d'abord un lien d'invitation");
      return;
    }
    
    const message = `Rejoins ma maison connectée sur SmartHome ! Voici ton lien d'accès : ${inviteLink}`;
    const emailUrl = `mailto:?subject=Invitation à rejoindre ma maison connectée&body=${encodeURIComponent(message)}`;
    
    window.open(emailUrl, '_blank');
    addLog('Invitation envoyée', 'Email', 'Système');
    toast.success('Ouverture de votre client email...');
    setShowInviteOptions(false);
  };
  
  
  const handleCopyInviteLink = () => {
    if (!inviteLink) {
      toast.error("Génère d'abord un lien d'invitation");
      return;
    }
    
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Lien d'invitation copié");
    setTimeout(() => setCopied(false), 2000);
  };
  
  const filteredRooms =
  activeFilter === 'all'
  ? rooms
  : rooms.filter(room => room.roomName === activeFilter);
  
  const totalRooms = rooms.length;
  
  const totalLightsOn = rooms.reduce(
    (total, room) =>
      total + room.devices.filter(device => device.type === 'LIGHT' && device.status).length,
    0
  );
  
  const totalDoorsOpen = rooms.reduce(
    (total, room) =>
      total + room.devices.filter(device => device.type === 'DOOR' && device.status).length,
    0
  );
  
  if (!isAuthenticated) {
    return (
      <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
      >
      <div className="register-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
      <Lock size={60} style={{ color: '#667eea', margin: '0 auto 20px' }} />
      <h2>Accès réservé</h2>
      <Link
      to="/login"
      className="btn-primary"
      style={{
        display: 'block',
        marginTop: '15px',
        textDecoration: 'none',
        textAlign: 'center'
      }}
      >
      Se connecter
      </Link>
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
    <h1 className="dashboard-title">
    Bienvenue, {user?.prenom || 'Propriétaire'} !
    </h1>
    </div>
    
    <div className="dashboard-actions">
    <button
    className="btn-primary"
    onClick={() => setShowAddRoomModal(true)}
    style={{
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    }}
    >
    <Plus size={18} /> Ajouter une pièce
    </button>
    
    <button
    className="btn-primary"
    onClick={async () => {
      const link = await generateInvitationLink();
      
      if (link) {
        setShowInviteOptions(true);
      }
    }}
    >
    <Share2 size={18} /> Inviter
    </button>
    
    <button className="btn-secondary" onClick={handleLogout}>
    <LogOut size={18} /> Déconnexion
    </button>
    </div>
    </header>
    
    {showInviteOptions && (
      <div className="invite-overlay" onClick={() => setShowInviteOptions(false)}>
      <div className="invite-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
      <div className="invite-modal-header">
      <h3>Inviter un membre</h3>
      <button className="modal-close" onClick={() => setShowInviteOptions(false)}>
      ×
      </button>
      </div>
      
      <div className="invite-modal-body">
      <p style={{ marginBottom: '15px', color: '#666' }}>
      Choisissez comment envoyer l'invitation :
      </p>
      
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
      style={{
        flex: 1,
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #d1d5db',
        fontSize: '0.85rem',
        background: '#f9fafb'
      }}
      />
      
      <button
      onClick={handleCopyInviteLink}
      style={{
        padding: '8px 16px',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
      >
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? 'Copié' : 'Copier'}
      </button>
      </div>
      
      <div
      style={{
        marginTop: '15px',
        padding: '12px',
        background: '#f0f4ff',
        borderRadius: '8px',
        textAlign: 'center'
      }}
      >
      <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#666' }}>
      Lien direct :
      </p>
      
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
    
    {showAddRoomModal && (
      <div className="invite-overlay" onClick={() => setShowAddRoomModal(false)}>
      <div className="invite-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
      <div className="invite-modal-header">
      <h3>Ajouter une nouvelle pièce</h3>
      <button className="modal-close" onClick={() => setShowAddRoomModal(false)}>
      ×
      </button>
      </div>
      
      <form onSubmit={handleAddRoom} style={{ display: 'grid', gap: '15px', marginTop: '10px' }}>
      <input
      type="text"
      placeholder="Nom de la pièce"
      value={newRoomName}
      onChange={e => setNewRoomName(e.target.value)}
      required
      style={{
        width: '100%',
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px'
      }}
      />
      
      <input
      type="number"
      placeholder="PIN de la lumière"
      value={newLightPin}
      onChange={e => setNewLightPin(e.target.value)}
      required
      style={{
        width: '100%',
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px'
      }}
      />
      
      <input
      type="number"
      placeholder="PIN de la porte (optionnel)"
      value={newDoorPin}
      onChange={e => setNewDoorPin(e.target.value)}
      style={{
        width: '100%',
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px'
      }}
      />
      
      <div
      style={{
        background: '#fef3c7',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '0.85rem',
        color: '#92400e'
      }}
      >
      La porte principale est déjà définie comme "{initialMainDoorName || mainDoorRoom?.roomName || 'aucune'}"
      </div>
      
      <button type="submit" className="btn-primary">
      Créer la pièce
      </button>
      </form>
      </div>
      </div>
    )}
    
    {addingDeviceRoomIdx !== null && (
      <div className="invite-overlay" onClick={() => setAddingDeviceRoomIdx(null)}>
      <div className="invite-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
      <div className="invite-modal-header">
      <h3>Ajouter un équipement</h3>
      <button className="modal-close" onClick={() => setAddingDeviceRoomIdx(null)}>
      ×
      </button>
      </div>
      
      <form onSubmit={handleAddDevice} style={{ display: 'grid', gap: '15px', marginTop: '10px' }}>
      <select
      value={newDeviceType}
      onChange={e => setNewDeviceType(e.target.value)}
      style={{
        width: '100%',
        padding: '10px',
        borderRadius: '6px'
      }}
      >
      <option value="LIGHT">Lumière</option>
      <option value="DOOR">Porte</option>
      <option value="TEMPERATURE">Capteur température</option>
      </select>
      
      <input
      type="number"
      placeholder="PIN matériel"
      value={newDevicePin}
      onChange={e => setNewDevicePin(e.target.value)}
      required
      style={{
        width: '100%',
        padding: '10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px'
      }}
      />
      
      <button type="submit" className="btn-primary">
      Confirmer l'ajout
      </button>
      </form>
      </div>
      </div>
    )}
    
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
    
    {pendingRequests.length > 0 && (
      <div className="room-card" style={{ marginBottom: '24px', padding: '20px' }}>
      <h2 style={{ marginTop: 0 }}>Demandes en attente</h2>
      
      {pendingRequests.map(request => (
        <div
        key={request.id}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          marginBottom: '10px',
          background: '#f9fafb'
        }}
        >
        <div>
        <strong>
        {request.firstName} {request.lastName}
        </strong>
        <br />
        <small style={{ color: '#6b7280' }}>
        {request.email}
        </small>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
        <button
        onClick={() => handleApproveRequest(request.id, true)}
        style={{
          background: '#10b981',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
        >
        Approuver
        </button>
        
        <button
        onClick={() => handleApproveRequest(request.id, false)}
        style={{
          background: '#ef4444',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
        >
        Refuser
        </button>
        </div>
        </div>
      ))}
      </div>
    )}
    
    {mainDoorRoom && mainDoorRoom.doorPin && (
      <div
      className="main-door-card"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        color: 'white'
      }}
      >
      <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}
      >
      <div>
      <h2
      style={{
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
      >
      <DoorOpen size={24} /> Porte principale - {mainDoorRoom.roomName}
      </h2>
      
      <p style={{ margin: '5px 0 0', opacity: 0.9 }}>
      PIN: {mainDoorRoom.doorPin} • Statut:{' '}
      {mainDoorStatus ? 'OUVERTE' : 'FERMÉE'}
      </p>
      </div>
      </div>
      </div>
    )}
    
    <div className="room-filter-nav">
    <button
    onClick={() => setActiveFilter('all')}
    className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
    >
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
    
    <div className="dashboard-grid">
    <div className="room-list">
    {filteredRooms.map((room) => {
      const realIdx = rooms.findIndex(r => r.roomName === room.roomName);
      const isEditing = editingRoomIdx === realIdx;
      const isMainDoor = room.hasMainDoor === true;
      
      return (
        <div
        key={room.id || realIdx}
        className="room-card"
        style={
          isMainDoor
          ? {
            border: '3px solid #667eea',
            backgroundColor: '#f0f4ff',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
          }
          : {}
        }
        >
        <div className="room-card-header">
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <input
          value={editRoomName}
          onChange={e => setEditRoomName(e.target.value)}
          placeholder="Nom de la pièce"
          style={{
            padding: '6px',
            borderRadius: '6px',
            border: '1px solid #d1d5db'
          }}
          />
          
          <input
          value={editLightPin}
          onChange={e => setEditLightPin(e.target.value)}
          placeholder="PIN lumière"
          type="number"
          style={{
            padding: '6px',
            borderRadius: '6px',
            border: '1px solid #d1d5db'
          }}
          />
          
          <input
          value={editDoorPin}
          onChange={e => setEditDoorPin(e.target.value)}
          placeholder="PIN porte"
          type="number"
          style={{
            padding: '6px',
            borderRadius: '6px',
            border: '1px solid #d1d5db'
          }}
          />
          
          <div style={{ display: 'flex', gap: '8px' }}>
          <button
          onClick={() => saveEditRoom(realIdx)}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          >
          <Save size={16} /> Sauvegarder
          </button>
          
          <button
          onClick={() => setEditingRoomIdx(null)}
          style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          >
          <X size={16} /> Annuler
          </button>
          </div>
          </div>
        ) : (
          <>
          <div style={{ flex: 1 }}>
          <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap'
          }}
          >
          <h2 style={{ margin: 0 }}>{room.roomName}</h2>
          
          {isMainDoor && (
            <span
            style={{
              background: '#667eea',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.7rem',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            >
            <DoorOpen size={12} /> PORTE PRINCIPALE
            </span>
          )}
          </div>
          
          {isMainDoor && (
            <small style={{ color: '#667eea', display: 'block', marginTop: '4px' }}>
            Utilisez le badge RFID pour accéder à cette porte
            </small>
          )}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
          <button
          onClick={() => startEditRoom(realIdx, room)}
          style={{
            background: 'none',
            border: 'none',
            color: '#667eea',
            cursor: 'pointer'
          }}
          >
          <Pencil size={15} /> Modifier
          </button>
          
          <button
          onClick={() => setConfirmDeleteIdx(realIdx)}
          style={{
            background: 'none',
            border: 'none',
            color: isMainDoor ? '#9ca3af' : '#ef4444',
            cursor: isMainDoor ? 'not-allowed' : 'pointer'
          }}
          disabled={isMainDoor}
          >
          <Trash2 size={15} /> Supprimer
          </button>
          </div>
          </>
        )}
        </div>
        
        {confirmDeleteIdx === realIdx && !isMainDoor && (
          <div
          style={{
            background: '#fef2f2',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
          >
          <span style={{ color: '#b91c1c' }}>
          Supprimer définitivement cette pièce ?
          </span>
          
          <div style={{ display: 'flex', gap: '8px' }}>
          <button
          onClick={() => deleteRoom(realIdx)}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 12px',
            cursor: 'pointer'
          }}
          >
          Oui
          </button>
          
          <button
          onClick={() => setConfirmDeleteIdx(null)}
          style={{
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 12px',
            cursor: 'pointer'
          }}
          >
          Non
          </button>
          </div>
          </div>
        )}
        
        <div className="room-devices">
        {room.devices.map(device => {
          const isOn = device.status;
          
          return (
            <div
            key={`${device.type}-${device.pin}`}
            className="device-line"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px dashed #e5e7eb'
            }}
            >
            <div>
            <div>
            <strong>
            {device.type === 'LIGHT'
              ? '💡 Lumière'
              : device.type === 'DOOR'
              ? '🚪 Porte'
              : '🌡️ Température'}
              </strong>
              
              {isMainDoor && device.type === 'DOOR' && (
                <span
                style={{
                  marginLeft: '8px',
                  fontSize: '0.7rem',
                  background: '#667eea20',
                  color: '#667eea',
                  padding: '2px 6px',
                  borderRadius: '12px'
                }}
                >
                RFID
                </span>
              )}
              </div>
              
              <small style={{ color: '#9ca3af' }}>
              PIN {device.pin}
              </small>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {device.type === 'TEMPERATURE' ? (
                <span style={{ color: '#ef4444', fontWeight: '700' }}>
                24°C
                </span>
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
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '20px'
              }}
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
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px'
          }}
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
      <div
      style={{
        borderBottom: '2px solid #f3f4f6',
        paddingBottom: '10px',
        marginBottom: '15px'
      }}
      >
      <h2
      style={{
        margin: 0,
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      >
      <CreditCard style={{ color: '#667eea' }} /> Gestion globale RFID
      </h2>
      
      <small style={{ color: '#6b7280' }}>
      Gérez les badges d'accès à la porte principale{' '}
      <strong style={{ color: '#667eea' }}>
      ({mainDoorRoom?.roomName || initialMainDoorName || 'aucune'})
      </strong>
      </small>
      </div>
      
      <form
      onSubmit={handleAddRfidCard}
      style={{
        background: '#f8fafc',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0'
      }}
      >
      <h3 style={{ fontSize: '0.9rem', margin: '0 0 10px 0', color: '#374151' }}>
      Ajouter un nouveau badge :
      </h3>
      
      <div style={{ display: 'grid', gap: '10px' }}>
      <input
      type="text"
      placeholder="Nom du propriétaire"
      value={newCardName}
      onChange={e => setNewCardName(e.target.value)}
      required
      style={{
        width: '100%',
        padding: '10px',
        fontSize: '0.9rem',
        borderRadius: '6px',
        border: '1px solid #cbd5e1'
      }}
      />
      
      <input
      type="text"
      placeholder="Code RFID, ex : 2385E5FD"
      value={newCardBadgeId}
      onChange={e => setNewCardBadgeId(e.target.value)}
      required
      style={{
        width: '100%',
        padding: '10px',
        fontSize: '0.9rem',
        borderRadius: '6px',
        border: '1px solid #cbd5e1'
      }}
      />
      
      <button
      type="submit"
      style={{
        background: '#667eea',
        color: 'white',
        border: 'none',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer'
      }}
      >
      Ajouter le badge
      </button>
      </div>
      </form>
      
      <div>
      <h3 style={{ fontSize: '0.9rem', margin: '0 0 10px 0', color: '#374151' }}>
      Badges enregistrés :{' '}
      {rfidCards.length === 0 && (
        <span style={{ fontWeight: 'normal', color: '#9ca3af' }}>
        (Aucun badge)
        </span>
      )}
      </h3>
      
      {rfidCards.length === 0 ? (
        <div
        style={{
          textAlign: 'center',
          padding: '30px',
          background: '#f9fafb',
          borderRadius: '8px',
          color: '#9ca3af'
        }}
        >
        <CreditCard size={40} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
        <p>Aucun badge enregistré</p>
        <small>Utilisez le formulaire ci-dessus pour ajouter des badges RFID</small>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rfidCards.map(card => (
          <div
          key={card.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            background: card.isBlocked ? '#fef2f2' : '#ffffff'
          }}
          >
          <div>
          <div
          style={{
            fontWeight: '600',
            color: card.isBlocked ? '#991b1b' : '#1f2937',
            fontSize: '0.9rem'
          }}
          >
          {card.name}
          {card.isBlocked && (
            <span
            style={{
              fontSize: '0.7rem',
              background: '#fecaca',
              color: '#991b1b',
              padding: '2px 6px',
              borderRadius: '4px',
              marginLeft: '8px'
            }}
            >
            BLOQUÉ
            </span>
          )}
          </div>
          
          <code style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {card.badgeId}
          </code>
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
          {card.isBlocked ? 'Débloquer' : 'Bloquer'}
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