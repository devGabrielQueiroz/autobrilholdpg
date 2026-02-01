/**
 * Controller de autenticação
 */

import * as authService from '../services/authService.js';

/**
 * POST /api/auth/login
 * Login do administrador
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }

    const result = await authService.login(email, password);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(401).json({ 
      error: error.message || 'Credenciais inválidas' 
    });
  }
}

/**
 * POST /api/auth/logout
 * Logout do administrador
 */
export async function logout(req, res) {
  try {
    await authService.logout(req.token);
    res.json({ 
      success: true, 
      message: 'Logout realizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ 
      error: 'Erro ao realizar logout' 
    });
  }
}

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
export async function me(req, res) {
  try {
    const user = await authService.verifyToken(req.token);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    res.status(401).json({ 
      error: 'Token inválido' 
    });
  }
}

/**
 * POST /api/auth/refresh
 * Renovar token de acesso
 */
export async function refresh(req, res) {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ 
        error: 'Refresh token é obrigatório' 
      });
    }

    const session = await authService.refreshSession(refresh_token);

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(401).json({ 
      error: 'Refresh token inválido' 
    });
  }
}
