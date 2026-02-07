import { prisma } from '../config/database.js';

/** GET lista de terapias (todas, con paciente). Fisioterapeuta */
export const getTerapias = async (req, res) => {
  try {
    const list = await prisma.terapiaRehabilitacion.findMany({
      include: {
        paciente: { select: { id: true, nombre: true, apellidos: true } },
        registradoPor: { select: { id: true, nombre: true, apellidos: true } },
      },
      orderBy: [{ efectuada: 'asc' }, { createdAt: 'desc' }],
    });
    res.json({ data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** GET terapias por paciente */
export const getByPaciente = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const list = await prisma.terapiaRehabilitacion.findMany({
      where: { pacienteId },
      include: {
        registradoPor: { select: { id: true, nombre: true, apellidos: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** POST crear terapia (Fisioterapeuta) */
export const create = async (req, res) => {
  try {
    const { pacienteId, nombreTerapia, descripcion } = req.body;
    if (!pacienteId?.trim()) return res.status(400).json({ message: 'Seleccione el residente' });
    if (!nombreTerapia?.trim()) return res.status(400).json({ message: 'El nombre de la terapia es obligatorio' });
    const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    const item = await prisma.terapiaRehabilitacion.create({
      data: {
        pacienteId,
        nombreTerapia: nombreTerapia.trim(),
        descripcion: descripcion?.trim() || null,
        registradoPorId: req.user?.id || null,
      },
      include: {
        paciente: { select: { id: true, nombre: true, apellidos: true } },
        registradoPor: { select: { id: true, nombre: true, apellidos: true } },
      },
    });
    res.status(201).json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** PATCH actualizar terapia (marcar efectuada, o editar nombre/descripcion) */
export const update = async (req, res) => {
  try {
    const { nombreTerapia, descripcion, efectuada } = req.body;
    const data = {};
    if (nombreTerapia !== undefined) data.nombreTerapia = nombreTerapia?.trim() || '';
    if (descripcion !== undefined) data.descripcion = descripcion?.trim() || null;
    if (efectuada !== undefined) {
      data.efectuada = Boolean(efectuada);
      if (data.efectuada) data.efectuadoAt = new Date();
      else data.efectuadoAt = null;
    }
    const item = await prisma.terapiaRehabilitacion.update({
      where: { id: req.params.id },
      data,
      include: {
        paciente: { select: { id: true, nombre: true, apellidos: true } },
        registradoPor: { select: { id: true, nombre: true, apellidos: true } },
      },
    });
    res.json({ data: item });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Terapia no encontrada' });
    res.status(500).json({ message: error.message });
  }
};

/** DELETE eliminar terapia */
export const remove = async (req, res) => {
  try {
    await prisma.terapiaRehabilitacion.delete({ where: { id: req.params.id } });
    res.json({ message: 'Terapia eliminada' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Terapia no encontrada' });
    res.status(500).json({ message: error.message });
  }
};
