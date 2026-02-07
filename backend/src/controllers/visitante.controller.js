import { prisma } from '../config/database.js';

/** GET listado de visitantes (para autocompletar / seleccionar en citas) */
export const getVisitantes = async (req, res) => {
  try {
    const { q } = req.query;
    const where = {};
    if (q?.trim()) {
      const term = `%${q.trim()}%`;
      where.OR = [
        { nombre: { contains: term, mode: 'insensitive' } },
        { apellidos: { contains: term, mode: 'insensitive' } },
        { telefono: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }
    const list = await prisma.visitante.findMany({
      where,
      orderBy: [{ nombre: 'asc' }, { apellidos: 'asc' }],
      take: 100,
    });
    res.json({ data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** POST crear visitante (datos del familiar/amigo) */
export const createVisitante = async (req, res) => {
  try {
    const { nombre, apellidos, telefono, email, relacionConPaciente, documento } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ message: 'El nombre es obligatorio' });
    const item = await prisma.visitante.create({
      data: {
        nombre: nombre.trim(),
        apellidos: apellidos?.trim() || null,
        telefono: telefono?.trim() || null,
        email: email?.trim() || null,
        relacionConPaciente: relacionConPaciente?.trim() || null,
        documento: documento?.trim() || null,
      },
    });
    res.status(201).json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** GET un visitante por id */
export const getVisitante = async (req, res) => {
  try {
    const item = await prisma.visitante.findUnique({
      where: { id: req.params.id },
    });
    if (!item) return res.status(404).json({ message: 'Visitante no encontrado' });
    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** PATCH actualizar visitante */
export const updateVisitante = async (req, res) => {
  try {
    const { nombre, apellidos, telefono, email, relacionConPaciente, documento } = req.body;
    const data = {};
    if (nombre !== undefined) data.nombre = nombre?.trim() || '';
    if (apellidos !== undefined) data.apellidos = apellidos?.trim() || null;
    if (telefono !== undefined) data.telefono = telefono?.trim() || null;
    if (email !== undefined) data.email = email?.trim() || null;
    if (relacionConPaciente !== undefined) data.relacionConPaciente = relacionConPaciente?.trim() || null;
    if (documento !== undefined) data.documento = documento?.trim() || null;
    const item = await prisma.visitante.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ data: item });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Visitante no encontrado' });
    res.status(500).json({ message: error.message });
  }
};
