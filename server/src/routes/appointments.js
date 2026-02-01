/**
 * Rotas de Agendamentos
 */

import { Router } from 'express';
import * as appointmentsController from '../controllers/appointmentsController.js';
import { requireAdminAuth } from '../middlewares/auth.js';

const router = Router();

// ============================================
// Rotas públicas (para clientes)
// ============================================

// Criar agendamento (cliente)
router.post('/public', appointmentsController.create);

// Buscar horários disponíveis
router.get('/availability', appointmentsController.getAvailability);

// ============================================
// Rotas protegidas (admin)
// ============================================

router.get('/', requireAdminAuth, appointmentsController.list);
router.get('/today', requireAdminAuth, appointmentsController.getToday);
router.get('/upcoming', requireAdminAuth, appointmentsController.getUpcoming);
router.get('/:id', requireAdminAuth, appointmentsController.getById);
router.post('/', requireAdminAuth, appointmentsController.create);
router.put('/:id', requireAdminAuth, appointmentsController.update);
router.patch('/:id/status', requireAdminAuth, appointmentsController.updateStatus);
router.delete('/:id', requireAdminAuth, appointmentsController.cancel);

export default router;
