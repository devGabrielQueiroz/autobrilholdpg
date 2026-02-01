/**
 * Rotas de Serviços
 */

import { Router } from 'express';
import * as servicesController from '../controllers/servicesController.js';
import { requireAdminAuth } from '../middlewares/auth.js';

const router = Router();

// Rotas públicas (apenas leitura de serviços ativos)
router.get('/public', async (req, res) => {
  req.query.active = 'true';
  return servicesController.list(req, res);
});

// Rotas protegidas (admin)
router.get('/', requireAdminAuth, servicesController.list);
router.get('/:id', requireAdminAuth, servicesController.getById);
router.post('/', requireAdminAuth, servicesController.create);
router.put('/:id', requireAdminAuth, servicesController.update);
router.patch('/:id/toggle', requireAdminAuth, servicesController.toggleStatus);
router.delete('/:id', requireAdminAuth, servicesController.remove);

export default router;
