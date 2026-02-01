/**
 * Agregador de rotas
 */

import { Router } from 'express';
import authRoutes from './auth.js';
import servicesRoutes from './services.js';
import appointmentsRoutes from './appointments.js';
import * as appointmentsController from '../controllers/appointmentsController.js';
import { requireAdminAuth } from '../middlewares/auth.js';

const router = Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de serviços
router.use('/services', servicesRoutes);

// Rotas de agendamentos
router.use('/appointments', appointmentsRoutes);

// Dashboard (protegido)
router.get('/dashboard', requireAdminAuth, appointmentsController.getDashboard);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AutoBrilho API'
  });
});

export default router;
