import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Regarde si l'utilisateur est connecté dans la session courante
  const isAuthenticated = sessionStorage.getItem('userProfile');

  if (!isAuthenticated) {
    // Si pas connecté, redirection immédiate vers la page de login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;