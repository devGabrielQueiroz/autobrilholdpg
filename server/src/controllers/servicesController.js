/**
 * Controller de Serviços
 */

import * as servicesService from '../services/servicesService.js';

/**
 * GET /api/services
 * Listar todos os serviços
 */
export async function list(req, res) {
  try {
    const { active } = req.query;
    const onlyActive = active === 'true';
    
    const services = await servicesService.listServices(onlyActive);
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar serviços' 
    });
  }
}

/**
 * GET /api/services/:id
 * Buscar serviço por ID
 */
export async function getById(req, res) {
  try {
    const { id } = req.params;
    const service = await servicesService.getServiceById(id);
    
    if (!service) {
      return res.status(404).json({ 
        error: 'Serviço não encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar serviço' 
    });
  }
}

/**
 * POST /api/services
 * Criar novo serviço
 */
export async function create(req, res) {
  try {
    const service = await servicesService.createService(req.body);
    
    res.status(201).json({
      success: true,
      data: service,
      message: 'Serviço criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(400).json({ 
      error: error.message || 'Erro ao criar serviço' 
    });
  }
}

/**
 * PUT /api/services/:id
 * Atualizar serviço
 */
export async function update(req, res) {
  try {
    const { id } = req.params;
    const service = await servicesService.updateService(id, req.body);
    
    res.json({
      success: true,
      data: service,
      message: 'Serviço atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(400).json({ 
      error: error.message || 'Erro ao atualizar serviço' 
    });
  }
}

/**
 * PATCH /api/services/:id/toggle
 * Ativar/Desativar serviço
 */
export async function toggleStatus(req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    if (typeof active !== 'boolean') {
      return res.status(400).json({ 
        error: 'Campo "active" deve ser boolean' 
      });
    }
    
    const service = await servicesService.toggleServiceStatus(id, active);
    
    res.json({
      success: true,
      data: service,
      message: `Serviço ${active ? 'ativado' : 'desativado'} com sucesso`
    });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    res.status(400).json({ 
      error: error.message || 'Erro ao alterar status do serviço' 
    });
  }
}

/**
 * DELETE /api/services/:id
 * Deletar serviço (soft delete)
 */
export async function remove(req, res) {
  try {
    const { id } = req.params;
    await servicesService.deleteService(id);
    
    res.json({
      success: true,
      message: 'Serviço removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover serviço:', error);
    res.status(400).json({ 
      error: error.message || 'Erro ao remover serviço' 
    });
  }
}
