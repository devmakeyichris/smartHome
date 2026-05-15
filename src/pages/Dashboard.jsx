import { useState, useEffect } from 'react';
import { Power, Lightbulb, DoorOpen, Home, User, Settings2, Share2, Copy, CheckCircle } from 'lucide-react';
import '../App.css';

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // État pour gérer l'animation de copie du lien
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('homeConfig');
    const savedUser = localStorage.getItem('userProfile');
    if (savedConfig) setRooms(JSON.parse(savedConfig));
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // FONCTION DE PARTAGE (Basée sur tes images 9236dd.jpg et 923380.png)
  const handleShareInvite = () => {
    // On simule un ID de maison unique (ou on prend celui de l'utilisateur s'il existe)
    const houseId = user?.houseId || "1"; 
    
    // Construction du lien : https://tonsite.com/register?houseId=1
    const inviteLink = `${window.location.origin}/register?houseId=${houseId}`;
    
    // Copie automatique dans le presse-papier
    navigator.clipboard.writeText(inviteLink);
    
    // Feedback visuel
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Optionnel : Ouvrir WhatsApp avec le lien pré-rempli
    const message = `Rejoins ma maison connectée sur SmartHome ! Voici ton lien d'accès : ${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const toggleDevice = (roomIndex, deviceType) => {
    const newRooms = [...rooms];
    const device = newRooms[roomIndex].devices.find(d => d.type === deviceType);
    if (device) {
      device.status = !device.status;
      setRooms(newRooms);
      localStorage.setItem('homeConfig', JSON.stringify(newRooms));
    }
  };

  const filteredRooms = activeFilter === 'all' 
    ? rooms 
    : rooms.filter(room => room.roomName === activeFilter);

  return (
    <div className="dashboard-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* 1. HEADER & SECTION PARTAGE */}
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

        {/* BOUTON D'INVITATION (Conforme à ton idée) */}
        <button 
          onClick={handleShareInvite}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '12px',
            border: 'none',
            background: copied ? '#10b981' : 'var(--primary)',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
          }}
        >
          {copied ? <CheckCircle size={18} /> : <Share2 size={18} />}
          {copied ? "Lien copié !" : "Inviter un membre"}
        </button>
      </header>

      {/* 2. NAVBAR DE SÉLECTION DES PIÈCES */}
      <div className="room-filter-nav" style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px', 
        overflowX: 'auto', 
        paddingBottom: '10px',
        borderBottom: '1px solid #eee' 
      }}>
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
            {room.roomName}
          </button>
        ))}
      </div>

      {/* 3. GRILLE DES PIÈCES FILTRÉES */}
      <div className="grid-devices" style={{ 
        display: 'grid', 
        gridTemplateColumns: activeFilter === 'all' ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr', 
        gap: '25px' 
      }}>
        {filteredRooms.map((room) => {
          const realIdx = rooms.findIndex(r => r.roomName === room.roomName);
          
          return (
            <div key={realIdx} className="room-card" style={{ 
              background: 'white', 
              borderRadius: '24px', 
              padding: '25px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
              border: '1px solid #f0f4f8'
            }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Settings2 size={18} color="var(--primary)" /> {room.roomName}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {room.devices.map((device) => (
                  <div key={device.type} className={`device-row ${device.status ? 'on' : 'off'}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div className="icon-box">
                        {device.type === 'light' ? <Lightbulb size={22} /> : <DoorOpen size={22} />}
                      </div>
                      <div>
                        <b style={{ display: 'block' }}>{device.type === 'light' ? 'Lumière' : 'Porte'}</b>
                        <small>PIN {device.pin}</small>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleDevice(realIdx, device.type)}
                      className={`power-btn ${device.status ? 'active' : ''}`}
                    >
                      <Power size={16} /> 
                      {device.status 
                        ? (device.type === 'light' ? 'Éteindre' : 'Fermer') 
                        : (device.type === 'light' ? 'Allumer' : 'Ouvrir')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;