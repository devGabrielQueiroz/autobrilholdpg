/**
 * Middlewares de autenticação e autorização
 */

import { supabase } from '../config/supabase.js';

/**
 * Middleware para verificar se o usuário está autenticado
 * Extrai o token do header Authorization
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token de autenticação não fornecido' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Token inválido ou expirado' 
      });
    }

    // Adicionar usuário à requisição
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ 
      error: 'Erro interno de autenticação' 
    });
  }
}

/**
 * Middleware para verificar se o usuário é admin
 * Deve ser usado APÓS requireAuth
 */
export async function requireAdmin(req, res, next) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado' 
      });
    }

    // Verificar role no user_metadata ou app_metadata
    const userRole = user.user_metadata?.role || user.app_metadata?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Acesso negado. Apenas administradores podem acessar este recurso.' 
      });
    }

    next();
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    return res.status(500).json({ 
      error: 'Erro interno de autorização' 
    });
  }
}

/**
 * Middleware combinado: autenticação + admin
 */
export const requireAdminAuth = [requireAuth, requireAdmin];
