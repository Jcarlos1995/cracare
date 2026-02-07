import { prisma } from '../config/database.js';
import { ROLES } from '../utils/roles.js';

function canAccessPaciente(user, paciente) {
  if (user.rol === ROLES.ADMINISTRADOR) return true;
  if (user.rol === ROLES.RAA && paciente?.raaId === user.id) return true;
  if ([ROLES.RAS, ROLES.MEDICO, ROLES.ENFERMERA].includes(user.rol)) return true;
  return false;
}

export const getByPaciente = async (req, res) => {
  try {
    const list = await prisma.medicamentoPaciente.findMany({
      where: { pacienteId: req.params.pacienteId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** GET grid de medicaciones: todos los medicamentos de pacientes que el usuario puede ver */
export const getGrid = async (req, res) => {
  try {
    const where = {};
    if (req.user.rol === ROLES.RAA) where.paciente = { raaId: req.user.id };
    const list = await prisma.medicamentoPaciente.findMany({
      where,
      include: {
        paciente: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            tratamientos: { select: { descripcion: true } },
          },
        },
        efectuadoPor: { select: { id: true, nombre: true, apellidos: true, rol: true } },
      },
      orderBy: [{ efectuado: 'asc' }, { createdAt: 'desc' }],
    });
    res.json({ data: list });
  } catch (error) {
    console.error('getGrid medicaciones:', error);
    res.status(500).json({ message: error.message });
  }
};

/** GET diario medicaciones: solo los marcados como efectuados (para Médico, RAS, Enfermeras) */
export const getDiarioMedicaciones = async (req, res) => {
  try {
    const where = { efectuado: true };
    if (req.user.rol === ROLES.RAA) where.paciente = { raaId: req.user.id };
    const list = await prisma.medicamentoPaciente.findMany({
      where,
      include: {
        paciente: { select: { id: true, nombre: true, apellidos: true } },
        efectuadoPor: { select: { id: true, nombre: true, apellidos: true, rol: true } },
      },
      orderBy: { efectuadoAt: 'desc' },
      take: 300,
    });
    res.json({ data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { medicamento, dosis, frecuencia, indicaciones, fechaHora } = req.body;
    if (!medicamento?.trim()) return res.status(400).json({ message: 'Medicamento es obligatorio' });
    const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    if (!canAccessPaciente(req.user, paciente)) return res.status(403).json({ message: 'No autorizado' });
    const item = await prisma.medicamentoPaciente.create({
      data: {
        pacienteId,
        medicamento: medicamento.trim(),
        dosis: dosis?.trim() || null,
        frecuencia: frecuencia?.trim() || null,
        indicaciones: indicaciones?.trim() || null,
        fechaHora: fechaHora ? new Date(fechaHora) : null,
        creadoPorId: req.user?.id || null,
      },
    });
    res.status(201).json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { medicamento, dosis, frecuencia, indicaciones, fechaHora, efectuado } = req.body;
    const existing = await prisma.medicamentoPaciente.findUnique({
      where: { id },
      include: { paciente: true },
    });
    if (!existing) return res.status(404).json({ message: 'No encontrado' });
    if (!canAccessPaciente(req.user, existing.paciente)) return res.status(403).json({ message: 'No autorizado' });
    const data = {};
    if (medicamento !== undefined) data.medicamento = medicamento.trim();
    if (dosis !== undefined) data.dosis = dosis?.trim() || null;
    if (frecuencia !== undefined) data.frecuencia = frecuencia?.trim() || null;
    if (indicaciones !== undefined) data.indicaciones = indicaciones?.trim() || null;
    if (fechaHora !== undefined) data.fechaHora = fechaHora ? new Date(fechaHora) : null;
    if (efectuado === true && !existing.efectuado) {
      data.efectuado = true;
      data.efectuadoAt = new Date();
      data.efectuadoPorId = req.user.id;
    } else if (efectuado === false) {
      data.efectuado = false;
      data.efectuadoAt = null;
      data.efectuadoPorId = null;
    }
    const item = await prisma.medicamentoPaciente.update({
      where: { id },
      data,
      include: {
        paciente: { select: { id: true, nombre: true, apellidos: true } },
        efectuadoPor: { select: { id: true, nombre: true, apellidos: true, rol: true } },
      },
    });
    res.json({ data: item });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'No encontrado' });
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const existing = await prisma.medicamentoPaciente.findUnique({
      where: { id: req.params.id },
      include: { paciente: true },
    });
    if (!existing) return res.status(404).json({ message: 'No encontrado' });
    if (!canAccessPaciente(req.user, existing.paciente)) return res.status(403).json({ message: 'No autorizado' });
    await prisma.medicamentoPaciente.delete({ where: { id: req.params.id } });
    res.json({ message: 'Eliminado' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'No encontrado' });
    res.status(500).json({ message: error.message });
  }
};
