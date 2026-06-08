import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// On importe App.css ici s'il contient le design global, 
// pour être sûr qu'il soit chargé dès le début.
import './App.css' 

const rootElement = document.getElementById('root');

if (!rootElement) throw new Error("L'élément root n'a pas été trouvé. Vérifie ton index.html");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
//