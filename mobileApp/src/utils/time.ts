export const now = () =>
  new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
