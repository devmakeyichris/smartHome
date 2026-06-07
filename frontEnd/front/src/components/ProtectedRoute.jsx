import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // On récupère le profil utilisateur depuis la session courante
  const userProfile = sessionStorage.getItem('userProfile');

  if (!userProfile) {
    // Si l'utilisateur n'est pas connecté ou inscrit, redirection forcée vers le login
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est connecté, on le laisse accéder à la page (Dashboard ou Setup)
  return children;
};

export default ProtectedRoute;