import { useState, useEffect } from 'react';
import { Settings, Save, Plus, Trash2 } from 'lucide-react';

const SetupPage = () => {
  const [piecesDetails, setPiecesDetails] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('tempUser'));
    if (saved && saved.piecesDetails) {
      setPiecesDetails(saved.piecesDetails);
    }
  }, []);

  const updatePiece = (index, field, value) => {
    const updated = [...piecesDetails];
    updated[index][field] = value;
    setPiecesDetails(updated);
  };

  const handleSave = () => {
    const existingData = JSON.parse(localStorage.getItem('tempUser')) || {};
    const newData = { ...existingData, piecesDetails };
    localStorage.setItem('tempUser', JSON.stringify(newData));
    alert("Configuration mise à jour !");
  };

  return (
    <div className="setup-container">
      <h2><Settings size={24} /> Paramètres de ma maison</h2>
      <div className="setup-card">
        {piecesDetails.map((piece, index) => (
          <div key={index} className="piece-item-setup">
            <input 
              value={piece.nom} 
              placeholder="Nom de la pièce"
              onChange={(e) => updatePiece(index, 'nom', e.target.value)} 
            />
            <input 
              value={piece.pinID} 
              type="number"
              placeholder="Pin Arduino"
              onChange={(e) => updatePiece(index, 'pinID', e.target.value)} 
            />
          </div>
        ))}
        <button onClick={handleSave} className="save-btn-setup">
          <Save size={18} /> Enregistrer les modifications
        </button>
      </div>
    </div>
  );
};

export default SetupPage;