import { prisma } from '../config/database.js';
import { ROLES } from '../utils/roles.js';

const ESTADOS = ['PENDIENTE', 'RECIBIDA', 'PEDIDO_LISTO', 'COMPLETADA'];

// RAA: listar sus propias solicitudes
export const getMisSolicitudes = async (req, res) => {
  try {
    const list = await prisma.solicitudInsumo.findMany({
      where: { solicitanteId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RAA: crear solicitud (notificación al admin)
export const createSolicitud = async (req, res) => {
  try {
    const { descripcion } = req.body;
    if (!descripcion?.trim()) {
      return res.status(400).json({ message: 'Descripción del insumo que falta es obligatoria' });
    }
    const sol = await prisma.solicitudInsumo.create({
      data: {
        solicitanteId: req.user.id,
        descripcion: descripcion.trim(),
        estado: 'PENDIENTE',
      },
    });
    res.status(201).json({ data: sol });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RAA: marcar como COMPLETADA (cuando recibe físicamente el insumo)
export const marcarCompletada = async (req, res) => {
  try {
    const { id } = req.params;
    const sol = await prisma.solicitudInsumo.findUnique({ where: { id } });
    if (!sol) return res.status(404).json({ message: 'Solicitud no encontrada' });
    if (sol.solicitanteId !== req.user.id) return res.status(403).json({ message: 'No autorizado' });
    if (sol.estado !== 'PEDIDO_LISTO') {
      return res.status(400).json({ message: 'Solo se puede completar cuando el pedido está listo' });
    }
    const updated = await prisma.solicitudInsumo.update({
      where: { id },
      data: { estado: 'COMPLETADA' },
    });
    res.json({ data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: listar todas las solicitudes
export const getTodasSolicitudes = async (req, res) => {
  try {
    const list = await prisma.solicitudInsumo.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: cambiar estado (RECIBIDA, PEDIDO_LISTO)
export const updateEstadoSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!ESTADOS.includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido. Use: PENDIENTE, RECIBIDA, PEDIDO_LISTO, COMPLETADA' });
    }
    const updated = await prisma.solicitudInsumo.update({
      where: { id },
      data: { estado },
    });
    res.json({ data: updated });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Solicitud no encontrada' });
    res.status(500).json({ message: error.message });
  }
};
