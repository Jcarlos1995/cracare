import { prisma } from '../config/database.js';
import { ROLES } from '../utils/roles.js';

function canAccessPaciente(user, paciente) {
  if (user.rol === ROLES.ADMINISTRADOR) return true;
  if (user.rol === ROLES.RAA && paciente.raaId === user.id) return true;
  if (user.rol === ROLES.RAS || user.rol === ROLES.MEDICO || user.rol === ROLES.ENFERMERA) return true;
  return false;
}

function canEditPaciente(user) {
  return user.rol === ROLES.ADMINISTRADOR || user.rol === ROLES.RAA;
}

export const getPacientes = async (req, res) => {
  try {
    const where = {};
    if (req.user.rol === ROLES.RAA) where.raaId = req.user.id;
    // RAS, MEDICO y ENFERMERA ven todos los pacientes
    const pacientes = await prisma.paciente.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });
    res.json({ data: pacientes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPaciente = async (req, res) => {
  try {
    const paciente = await prisma.paciente.findUnique({
      where: { id: req.params.id },
      include: { medicamentos: true, tratamientos: true },
    });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    if (!canAccessPaciente(req.user, paciente)) return res.status(403).json({ message: 'No autorizado' });
    res.json({ data: paciente });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPaciente = async (req, res) => {
  try {
    if (!canEditPaciente(req.user)) return res.status(403).json({ message: 'Solo administrador o RAA pueden crear pacientes' });
    const { nombre, apellidos, dniNif, fechaNacimiento, fechaIngreso, activo, raaId, alergias, patologias } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ message: 'Nombre es obligatorio' });
    const data = {
      nombre: nombre.trim(),
      apellidos: apellidos?.trim() || null,
      dniNif: dniNif?.trim() || null,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
      fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : null,
      activo: activo !== false,
      alergias: alergias?.trim() || null,
      patologias: patologias?.trim() || null,
    };
    if (req.user.rol === ROLES.RAA) data.raaId = req.user.id;
    else if (raaId) data.raaId = raaId;
    const paciente = await prisma.paciente.create({ data });
    res.status(201).json({ data: paciente });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePaciente = async (req, res) => {
  try {
    const paciente = await prisma.paciente.findUnique({ where: { id: req.params.id } });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    if (!canEditPaciente(req.user)) return res.status(403).json({ message: 'Solo administrador o RAA pueden editar datos del paciente' });
    if (!canAccessPaciente(req.user, paciente)) return res.status(403).json({ message: 'No autorizado' });
    const { nombre, apellidos, dniNif, fechaNacimiento, fechaIngreso, activo, raaId, alergias, patologias } = req.body;
    const data = {};
    if (nombre !== undefined) data.nombre = nombre.trim();
    if (apellidos !== undefined) data.apellidos = apellidos?.trim() || null;
    if (dniNif !== undefined) data.dniNif = dniNif?.trim() || null;
    if (fechaNacimiento !== undefined) data.fechaNacimiento = fechaNacimiento ? new Date(fechaNacimiento) : null;
    if (fechaIngreso !== undefined) data.fechaIngreso = fechaIngreso ? new Date(fechaIngreso) : null;
    if (activo !== undefined) data.activo = Boolean(activo);
    if (alergias !== undefined) data.alergias = alergias?.trim() || null;
    if (patologias !== undefined) data.patologias = patologias?.trim() || null;
    if (req.user.rol === ROLES.ADMINISTRADOR && raaId !== undefined) data.raaId = raaId || null;
    const updated = await prisma.paciente.update({ where: { id: req.params.id }, data });
    res.json({ data: updated });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Paciente no encontrado' });
    res.status(500).json({ message: error.message });
  }
};

export const deletePaciente = async (req, res) => {
  try {
    const paciente = await prisma.paciente.findUnique({ where: { id: req.params.id } });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    if (!canEditPaciente(req.user)) return res.status(403).json({ message: 'Solo administrador o RAA pueden eliminar pacientes' });
    if (!canAccessPaciente(req.user, paciente)) return res.status(403).json({ message: 'No autorizado' });
    await prisma.paciente.delete({ where: { id: req.params.id } });
    res.json({ message: 'Paciente eliminado' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Paciente no encontrado' });
    res.status(500).json({ message: error.message });
  }
};

export const uploadHojaClinica = async (req, res) => {
  try {
    if (req.user.rol === ROLES.RAS) return res.status(403).json({ message: 'RAS solo puede visualizar la hoja clínica, no subirla' });
    if (!req.file) return res.status(400).json({ message: 'No se envió ningún archivo PDF' });
    const paciente = await prisma.paciente.findUnique({ where: { id: req.params.id } });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    if (!canAccessPaciente(req.user, paciente)) return res.status(403).json({ message: 'No autorizado' });
    const relativePath = `/uploads/hojas-clinicas/${req.file.filename}`;
    const updated = await prisma.paciente.update({
      where: { id: req.params.id },
      data: { hojaClinicaUrl: relativePath },
    });
    res.json({ data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
