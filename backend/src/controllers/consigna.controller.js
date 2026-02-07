import { prisma } from '../config/database.js';
import { ROLE_LABELS } from '../utils/roles.js';

export const getConsignas = async (req, res) => {
  try {
    const consignas = await prisma.consigna.findMany({
      include: {
        autor: {
          select: { id: true, nombre: true, apellidos: true, rol: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const data = consignas.map((c) => ({
      ...c,
      autorNombre: [c.autor.nombre, c.autor.apellidos].filter(Boolean).join(' '),
      autorRol: ROLE_LABELS[c.autor.rol] || c.autor.rol,
    }));
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConsigna = async (req, res) => {
  try {
    const consigna = await prisma.consigna.findUnique({
      where: { id: req.params.id },
      include: {
        autor: {
          select: { id: true, nombre: true, apellidos: true, rol: true },
        },
      },
    });
    if (!consigna) return res.status(404).json({ message: 'Consigna no encontrada' });
    res.json({
      data: {
        ...consigna,
        autorNombre: [consigna.autor.nombre, consigna.autor.apellidos].filter(Boolean).join(' '),
        autorRol: ROLE_LABELS[consigna.autor.rol] || consigna.autor.rol,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createConsigna = async (req, res) => {
  try {
    const { titulo, contenido } = req.body;
    if (!titulo?.trim() || !contenido?.trim()) {
      return res.status(400).json({ message: 'Título y contenido son obligatorios' });
    }
    const consigna = await prisma.consigna.create({
      data: {
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        autorId: req.user.id,
      },
      include: {
        autor: {
          select: { id: true, nombre: true, apellidos: true, rol: true },
        },
      },
    });
    res.status(201).json({
      data: {
        ...consigna,
        autorNombre: [consigna.autor.nombre, consigna.autor.apellidos].filter(Boolean).join(' '),
        autorRol: ROLE_LABELS[consigna.autor.rol] || consigna.autor.rol,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateConsigna = async (req, res) => {
  try {
    const { titulo, contenido } = req.body;
    const data = {};
    if (titulo !== undefined) data.titulo = titulo.trim();
    if (contenido !== undefined) data.contenido = contenido.trim();
    const consigna = await prisma.consigna.update({
      where: { id: req.params.id },
      data,
      include: {
        autor: {
          select: { id: true, nombre: true, apellidos: true, rol: true },
        },
      },
    });
    res.json({
      data: {
        ...consigna,
        autorNombre: [consigna.autor.nombre, consigna.autor.apellidos].filter(Boolean).join(' '),
        autorRol: ROLE_LABELS[consigna.autor.rol] || consigna.autor.rol,
      },
    });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Consigna no encontrada' });
    res.status(500).json({ message: error.message });
  }
};

export const deleteConsigna = async (req, res) => {
  try {
    await prisma.consigna.delete({ where: { id: req.params.id } });
    res.json({ message: 'Consigna eliminada' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Consigna no encontrada' });
    res.status(500).json({ message: error.message });
  }
};
