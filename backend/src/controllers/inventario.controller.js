import { prisma } from '../config/database.js';

export const getInventario = async (req, res) => {
  try {
    const items = await prisma.inventario.findMany({
      orderBy: { nombre: 'asc' },
    });
    res.json({ data: items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInventarioItem = async (req, res) => {
  try {
    const item = await prisma.inventario.findUnique({
      where: { id: req.params.id },
    });
    if (!item) return res.status(404).json({ message: 'Insumo no encontrado' });
    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createInventario = async (req, res) => {
  try {
    const { nombre, descripcion, cantidad, unidad, categoria, minimo } = req.body;
    if (!nombre?.trim() || unidad?.trim() === undefined) {
      return res.status(400).json({ message: 'Nombre y unidad son obligatorios' });
    }
    const item = await prisma.inventario.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
        cantidad: Number(cantidad) || 0,
        unidad: (unidad || 'unidades').trim(),
        categoria: (categoria || 'sanidad').trim(),
        minimo: minimo != null && minimo !== '' ? Number(minimo) : null,
      },
    });
    res.status(201).json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInventario = async (req, res) => {
  try {
    const { nombre, descripcion, cantidad, unidad, categoria, minimo } = req.body;
    const data = {};
    if (nombre !== undefined) data.nombre = nombre.trim();
    if (descripcion !== undefined) data.descripcion = descripcion?.trim() || null;
    if (cantidad !== undefined) data.cantidad = Number(cantidad);
    if (unidad !== undefined) data.unidad = unidad.trim();
    if (categoria !== undefined) data.categoria = categoria.trim();
    if (minimo !== undefined) data.minimo = minimo === '' || minimo == null ? null : Number(minimo);
    const item = await prisma.inventario.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ data: item });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Insumo no encontrado' });
    res.status(500).json({ message: error.message });
  }
};

export const deleteInventario = async (req, res) => {
  try {
    await prisma.inventario.delete({ where: { id: req.params.id } });
    res.json({ message: 'Insumo eliminado' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Insumo no encontrado' });
    res.status(500).json({ message: error.message });
  }
};
