import { prisma } from '../config/database.js';
import { ROLES } from '../utils/roles.js';

function canAccessPaciente(user, paciente) {
  if (user.rol === ROLES.ADMINISTRADOR) return true;
  if (user.rol === ROLES.RAA && paciente.raaId === user.id) return true;
  if (user.rol === ROLES.RAS || user.rol === ROLES.MEDICO) return true;
  return false;
}

/** GET listado de consignas personales de un paciente (quien pueda ver el paciente) */
export const getByPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    if (!canAccessPaciente(req.user, paciente)) return res.status(403).json({ message: 'No autorizado' });
    const list = await prisma.consignaPersonal.findMany({
      where: { pacienteId },
      include: { autor: { select: { id: true, nombre: true, apellidos: true, rol: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** POST nueva consigna personal (cualquier usuario autenticado que pueda acceder al paciente) */
export const create = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { contenido } = req.body;
    if (!contenido?.trim()) return res.status(400).json({ message: 'El contenido es obligatorio' });
    const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    if (!canAccessPaciente(req.user, paciente)) return res.status(403).json({ message: 'No autorizado' });
    const item = await prisma.consignaPersonal.create({
      data: {
        pacienteId,
        autorId: req.user.id,
        contenido: contenido.trim(),
      },
      include: { autor: { select: { id: true, nombre: true, apellidos: true, rol: true } } },
    });
    res.status(201).json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** GET diario unificado: todas las consignas personales (Médico / Admin) */
export const getDiarioUnificado = async (req, res) => {
  try {
    const { fecha, pacienteId } = req.query;
    const where = {};
    if (pacienteId) where.pacienteId = pacienteId;
    if (fecha) {
      const dayStart = new Date(fecha);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      where.createdAt = { gte: dayStart, lt: dayEnd };
    }
    const list = await prisma.consignaPersonal.findMany({
      where,
      include: {
        paciente: { select: { id: true, nombre: true, apellidos: true } },
        autor: { select: { id: true, nombre: true, apellidos: true, rol: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    res.json({ data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
