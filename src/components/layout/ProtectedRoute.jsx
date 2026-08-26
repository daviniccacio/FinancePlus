// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ session, children }) {
  // Se não existir sessão ativa, redireciona o utilizador para a raiz (login)
  if (!session) {
    return <Navigate to="/" replace />;
  }

  // Se estiver logado, renderiza a página protegida solicitada
  return children;
}