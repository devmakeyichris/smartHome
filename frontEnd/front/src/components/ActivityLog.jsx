import React from 'react';
import { Clock, Activity } from 'lucide-react';

const ActivityLog = ({ logs }) => {
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '24px', 
      padding: '25px', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
      border: '1px solid #f0f4f8',
      maxHeight: '600px',
      overflowY: 'auto'
    }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Activity size={18} color="var(--primary)" /> Historique d'activité
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {logs.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>Aucune activité détectée</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px',
              borderRadius: '12px',
              background: '#f8fafc'
            }}>
              <div>
                <b style={{ display: 'block', fontSize: '0.95rem' }}>{log.action}</b>
                <small style={{ color: '#64748b' }}>{log.device} • {log.room}</small>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem' }}>
                <Clock size={14} /> {log.time}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;