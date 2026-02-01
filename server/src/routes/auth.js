/**
 * Rotas de autenticação
 */

import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Rotas públicas
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// Rotas protegidas
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
