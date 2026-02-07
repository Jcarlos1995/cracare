import { prisma } from '../config/database.js';

export const getByPaciente = async (req, res) => {
  try {
    const list = await prisma.tratamientoPaciente.findMany({
      where: { pacienteId: req.params.pacienteId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { descripcion } = req.body;
    if (!descripcion?.trim()) return res.status(400).json({ message: 'Descripción es obligatoria' });
    const item = await prisma.tratamientoPaciente.create({
      data: {
        pacienteId,
        descripcion: descripcion.trim(),
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
    const { descripcion } = req.body;
    const item = await prisma.tratamientoPaciente.update({
      where: { id },
      data: { descripcion: descripcion?.trim() || '' },
    });
    res.json({ data: item });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'No encontrado' });
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    await prisma.tratamientoPaciente.delete({ where: { id: req.params.id } });
    res.json({ message: 'Eliminado' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'No encontrado' });
    res.status(500).json({ message: error.message });
  }
};
