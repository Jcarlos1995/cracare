import { prisma } from '../config/database.js';

export const getMovimientos = async (req, res) => {
  try {
    const { anio, mes } = req.query;
    const where = {};
    if (anio != null && anio !== '') where.anio = Number(anio);
    if (mes != null && mes !== '') where.mes = Number(mes);
    const items = await prisma.movimiento.findMany({
      where,
      orderBy: [{ fecha: 'desc' }],
    });
    res.json({ data: items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMovimiento = async (req, res) => {
  try {
    const { fecha, tipo, concepto, monto, categoria } = req.body;
    if (!fecha || !tipo || !concepto || monto == null || monto === '') {
      return res.status(400).json({ message: 'Fecha, tipo, concepto y monto son obligatorios' });
    }
    if (!['INGRESO', 'GASTO'].includes(tipo)) {
      return res.status(400).json({ message: 'Tipo debe ser INGRESO o GASTO' });
    }
    const d = new Date(fecha);
    const mes = d.getMonth() + 1;
    const anio = d.getFullYear();
    const item = await prisma.movimiento.create({
      data: {
        fecha: new Date(fecha),
        tipo,
        concepto: concepto.trim(),
        monto: Number(monto),
        categoria: categoria?.trim() || null,
        mes,
        anio,
      },
    });
    res.status(201).json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMovimiento = async (req, res) => {
  try {
    const { fecha, tipo, concepto, monto, categoria } = req.body;
    const data = {};
    if (fecha) {
      data.fecha = new Date(fecha);
      data.mes = new Date(fecha).getMonth() + 1;
      data.anio = new Date(fecha).getFullYear();
    }
    if (tipo !== undefined) data.tipo = tipo;
    if (concepto !== undefined) data.concepto = concepto.trim();
    if (monto !== undefined) data.monto = Number(monto);
    if (categoria !== undefined) data.categoria = categoria?.trim() || null;
    const item = await prisma.movimiento.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ data: item });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Movimiento no encontrado' });
    res.status(500).json({ message: error.message });
  }
};

export const deleteMovimiento = async (req, res) => {
  try {
    await prisma.movimiento.delete({ where: { id: req.params.id } });
    res.json({ message: 'Movimiento eliminado' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Movimiento no encontrado' });
    res.status(500).json({ message: error.message });
  }
};
