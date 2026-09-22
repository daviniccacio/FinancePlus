// src/components/layout/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

/**
 * Componente de Proteção de Rotas.
 * Verifica se existe uma sessão ativa. Se não existir, redireciona para a tela de login.
 */
export default function ProtectedRoute({ session, children }) {
  // 🌟 Se não houver utilizador autenticado, envia DIRETO para /login (e não para '/')
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}