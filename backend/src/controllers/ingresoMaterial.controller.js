import { prisma } from '../config/database.js';

/** GET listado de ingresos de materiales (filtros: fecha, categoria) */
export const getIngresosMateriales = async (req, res) => {
  try {
    const { fecha, categoria, desde, hasta } = req.query;
    const where = {};
    if (categoria) where.categoria = categoria;
    if (fecha) {
      const dayStart = new Date(fecha);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      where.fecha = { gte: dayStart, lt: dayEnd };
    }
    if (desde || hasta) {
      where.fecha = where.fecha || {};
      if (desde) {
        const d = new Date(desde);
        d.setHours(0, 0, 0, 0);
        where.fecha.gte = d;
      }
      if (hasta) {
        const d = new Date(hasta);
        d.setHours(23, 59, 59, 999);
        where.fecha.lte = d;
      }
    }
    const list = await prisma.ingresoMaterial.findMany({
      where,
      include: {
        registradoPor: { select: { id: true, nombre: true, apellidos: true } },
      },
      orderBy: [{ fecha: 'desc' }, { createdAt: 'desc' }],
      take: 500,
    });
    res.json({ data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** POST registrar ingreso de material */
export const createIngresoMaterial = async (req, res) => {
  try {
    const { fecha, categoria, descripcion, cantidad, unidad, observaciones } = req.body;
    if (!categoria || !['SANITARIA', 'BASICOS_OTROS'].includes(categoria)) {
      return res.status(400).json({ message: 'Categoría debe ser SANITARIA o BASICOS_OTROS' });
    }
    if (!descripcion?.trim()) return res.status(400).json({ message: 'La descripción es obligatoria' });

    const fechaDate = fecha ? new Date(fecha) : new Date();
    if (isNaN(fechaDate.getTime())) return res.status(400).json({ message: 'Fecha no válida' });

    const item = await prisma.ingresoMaterial.create({
      data: {
        fecha: fechaDate,
        categoria,
        descripcion: descripcion.trim(),
        cantidad: cantidad != null && cantidad !== '' ? Number(cantidad) : null,
        unidad: unidad?.trim() || null,
        observaciones: observaciones?.trim() || null,
        registradoPorId: req.user?.id || null,
      },
      include: {
        registradoPor: { select: { id: true, nombre: true, apellidos: true } },
      },
    });
    res.status(201).json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** GET un ingreso por id */
export const getIngresoMaterial = async (req, res) => {
  try {
    const item = await prisma.ingresoMaterial.findUnique({
      where: { id: req.params.id },
      include: {
        registradoPor: { select: { id: true, nombre: true, apellidos: true } },
      },
    });
    if (!item) return res.status(404).json({ message: 'Ingreso no encontrado' });
    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
