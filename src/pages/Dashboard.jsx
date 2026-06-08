import { useState, useEffect } from 'react';
import { Power, Lightbulb, DoorOpen, Home, User, Settings2, Share2, Copy, CheckCircle } from 'lucide-react';
import '../App.css';
import ActivityLog from '../components/ActivityLog';
import toast, { Toaster } from 'react-hot-toast'; // Import pour les notifications

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [copied, setCopied] = useState(false);

  // --- État pour l'historique ---
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const savedConfig = sessionStorage.getItem('homeConfig');
    const savedUser = sessionStorage.getItem('userProfile');
    if (savedConfig) setRooms(JSON.parse(savedConfig));
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // --- Fonction pour ajouter un log dynamiquement ---
  const addLog = (action, deviceName, roomName) => {
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newEntry = { action, device: deviceName, room: roomName, time };
    setLogs(prevLogs => [newEntry, ...prevLogs]); // Ajoute au début de la liste
  };

  const handleShareInvite = () => {
    const houseId = user?.houseId || "1"; 
    const inviteLink = `${window.location.origin}/register?houseId=${houseId}`;
    navigator.clipboard.writeText(inviteLink);
    
    setCopied(true);
    toast.success("Lien d'invitation copié !"); // Notification toast
    setTimeout(() => setCopied(false), 2000);

    const message = `Rejoins ma maison connectée sur SmartHome ! Voici ton lien d'accès : ${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // --- toggleDevice dynamique ---
  const toggleDevice = (roomIndex, deviceType) => {
    const newRooms = [...rooms];
    const room = newRooms[roomIndex];
    const device = room.devices.find(d => d.type === deviceType);

    if (device) {
      device.status = !device.status;
      setRooms(newRooms);
      sessionStorage.setItem('homeConfig', JSON.stringify(newRooms));

      // 1. Définir le nom de l'action pour le log
      const actionName = device.status 
        ? (device.type === 'light' ? 'Allumé' : 'Ouvert') 
        : (device.type === 'light' ? 'Éteint' : 'Fermé');
      
      const deviceLabel = device.type === 'light' ? 'Lumière' : 'Porte';

      // 2. Ajouter à l'historique dynamique
      addLog(actionName, deviceLabel, room.roomName);

      // 3. Afficher la notification (Point 2)
      if (device.status) {
        toast.success(`${deviceLabel} ${actionName.toLowerCase()} dans ${room.roomName}`);
      } else {
        toast.error(`${deviceLabel} ${actionName.toLowerCase()} dans ${room.roomName}`);
      }
    }
  };

  const filteredRooms = activeFilter === 'all' 
    ? rooms 
    : rooms.filter(room => room.roomName === activeFilter);

  return (
    <div className="dashboard-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Composant de notification */}
      <Toaster position="top-right" />

      {/* 1. HEADER */}
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="user-badge" style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '50%' }}>
            <User size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Bienvenue, {user?.prenom || 'Licide'} !</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}><Home size={14} /> {user?.nomMaison || 'Ma Villa'}</p>
          </div>
        </div>

        <button 
          onClick={handleShareInvite}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px',
            border: 'none', background: copied ? '#10b981' : 'var(--primary)', color: 'white',
            fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
          }}
        >
          {copied ? <CheckCircle size={18} /> : <Share2 size={18} />}
          {copied ? "Lien copié !" : "Inviter un membre"}
        </button>
      </header>

      {/* 2. NAVBAR FILTRES */}
      <div className="room-filter-nav" style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
        <button onClick={() => setActiveFilter('all')} className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}>
          Toute la maison
        </button>
        {rooms.map((room, idx) => (
          <button key={idx} onClick={() => setActiveFilter(room.roomName)} className={`filter-btn ${activeFilter === room.roomName ? 'active' : ''}`}>
            {room.roomName}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', alignItems: 'start' }}>
        
        {/* 3. GRILLE DES PIÈCES */}
        <div className="grid-devices" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredRooms.map((room) => {
            const realIdx = rooms.findIndex(r => r.roomName === room.roomName);
            return (
              <div key={realIdx} className="room-card" style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f0f4f8' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Settings2 size={18} color="var(--primary)" /> {room.roomName}
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {room.devices.map((device) => {
                    // CONDITION DE DÉTECTION : Porte principale sur la broche du module RFID (ex: PIN 7)
                    const isMainDoor = device.type === 'door' && device.pin === 7;

                    return (
                      <div key={device.type} className={`device-row ${device.status ? 'on' : 'off'}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div className="icon-box">
                            {device.type === 'light' ? <Lightbulb size={22} /> : <DoorOpen size={22} />}
                          </div>
                          <div>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <b style={{ margin: 0 }}>{device.type === 'light' ? 'Lumière' : 'Porte'}</b>
                              
                              {/* AJOUT : Si c'est la porte d'entrée RFID, on affiche le petit badge */}
                              {isMainDoor && (
                                <span style={{ 
                                  background: '#e0e7ff', 
                                  color: '#4f46e5', 
                                  fontSize: '0.65rem', 
                                  padding: '2px 6px', 
                                  borderRadius: '6px', 
                                  fontWeight: '700' 
                                }}>
                                  🔑 RFID
                                </span>
                              )}
                            </span>
                            <small>PIN {device.pin}</small>
                          </div>
                        </div>
                        <button onClick={() => toggleDevice(realIdx, device.type)} className={`power-btn ${device.status ? 'active' : ''}`}>
                          <Power size={16} /> 
                          {device.status ? (device.type === 'light' ? 'Éteindre' : 'Fermer') : (device.type === 'light' ? 'Allumer' : 'Ouvrir')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- 4. COMPOSANT ACTIVITY LOG --- */}
        <ActivityLog logs={logs} />

      </div>
    </div>
  );
};

export default Dashboard;