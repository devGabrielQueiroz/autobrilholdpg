/**
 * Service para operações de autenticação
 */

import { supabase } from '../config/supabase.js';

/**
 * Login com email e senha
 * @param {string} email 
 * @param {string} password 
 */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  // Verificar se é admin
  const userRole = data.user?.user_metadata?.role || data.user?.app_metadata?.role;
  
  if (userRole !== 'admin') {
    // Fazer logout se não for admin
    await supabase.auth.signOut();
    throw new Error('Acesso negado. Apenas administradores podem fazer login.');
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      role: userRole,
      name: data.user.user_metadata?.name || 'Administrador'
    },
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at
    }
  };
}

/**
 * Logout
 * @param {string} token - Access token para invalidar
 */
export async function logout(token) {
  // Configurar o cliente com o token do usuário
  const { error } = await supabase.auth.signOut();
  
  if (error) throw error;
  
  return { message: 'Logout realizado com sucesso' };
}

/**
 * Verificar token e retornar dados do usuário
 * @param {string} token 
 */
export async function verifyToken(token) {
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Token inválido');
  }

  const userRole = user.user_metadata?.role || user.app_metadata?.role;

  return {
    id: user.id,
    email: user.email,
    role: userRole,
    name: user.user_metadata?.name || 'Administrador'
  };
}

/**
 * Refresh token
 * @param {string} refreshToken 
 */
export async function refreshSession(refreshToken) {
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken
  });

  if (error) throw error;

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at
  };
}
