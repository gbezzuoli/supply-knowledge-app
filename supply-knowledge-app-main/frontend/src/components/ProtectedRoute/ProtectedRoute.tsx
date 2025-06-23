// Arquivo: src/components/ProtectedRoute/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../../services/authService';

// Este componente recebe outros componentes como "filhos" (children)
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!isLoggedIn()) {
    // Se não estiver logado, redireciona para a página de login
    return <Navigate to="/login" />;
  }
  // Se estiver logado, renderiza o componente filho (a página protegida)
  return children;
};

export default ProtectedRoute;