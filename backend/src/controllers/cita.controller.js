import { prisma } from '../config/database.js';

/** GET listado de citas (filtros: fecha, pacienteId, estado) */
export const getCitas = async (req, res) => {
  try {
    const { fecha, pacienteId, estado, desde, hasta } = req.query;
    const where = {};
    if (pacienteId) where.pacienteId = pacienteId;
    if (estado) where.estado = estado;
    if (fecha) {
      const dayStart = new Date(fecha);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      where.fechaHora = { gte: dayStart, lt: dayEnd };
    }
    if (desde || hasta) {
      where.fechaHora = {};
      if (desde) {
        const d = new Date(desde);
        d.setHours(0, 0, 0, 0);
        where.fechaHora.gte = d;
      }
      if (hasta) {
        const d = new Date(hasta);
        d.setHours(23, 59, 59, 999);
        where.fechaHora.lte = d;
      }
    }
    const list = await prisma.cita.findMany({
      where,
      include: {
        paciente: { select: { id: true, nombre: true, apellidos: true } },
        visitante: { select: { id: true, nombre: true, apellidos: true, telefono: true, relacionConPaciente: true } },
      },
      orderBy: { fechaHora: 'asc' },
      take: 500,
    });
    res.json({ data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** GET citas agendadas (hoy y futuro) — para dashboard recepcionista */
export const getCitasAgendadas = async (req, res) => {
  try {
    const now = new Date();
    now.setSeconds(0, 0);
    const list = await prisma.cita.findMany({
      where: {
        fechaHora: { gte: now },
        estado: 'AGENDADA',
      },
      include: {
        paciente: { select: { id: true, nombre: true, apellidos: true } },
        visitante: { select: { id: true, nombre: true, apellidos: true, telefono: true, relacionConPaciente: true } },
      },
      orderBy: { fechaHora: 'asc' },
      take: 100,
    });
    res.json({ data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** GET una cita por id */
export const getCita = async (req, res) => {
  try {
    const item = await prisma.cita.findUnique({
      where: { id: req.params.id },
      include: {
        paciente: { select: { id: true, nombre: true, apellidos: true } },
        visitante: true,
      },
    });
    if (!item) return res.status(404).json({ message: 'Cita no encontrada' });
    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** POST crear cita (paciente + visitante + fecha/hora) */
export const createCita = async (req, res) => {
  try {
    const { pacienteId, visitanteId, fechaHora, observaciones } = req.body;
    if (!pacienteId?.trim()) return res.status(400).json({ message: 'Seleccione el paciente a visitar' });
    if (!visitanteId?.trim()) return res.status(400).json({ message: 'Seleccione o registre el visitante' });
    const fh = fechaHora ? new Date(fechaHora) : null;
    if (!fh || isNaN(fh.getTime())) return res.status(400).json({ message: 'Fecha y hora son obligatorias' });

    const [paciente, visitante] = await Promise.all([
      prisma.paciente.findUnique({ where: { id: pacienteId } }),
      prisma.visitante.findUnique({ where: { id: visitanteId } }),
    ]);
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    if (!visitante) return res.status(404).json({ message: 'Visitante no encontrado' });

    const item = await prisma.cita.create({
      data: {
        pacienteId,
        visitanteId,
        fechaHora: fh,
        observaciones: observaciones?.trim() || null,
      },
      include: {
        paciente: { select: { id: true, nombre: true, apellidos: true } },
        visitante: { select: { id: true, nombre: true, apellidos: true, telefono: true, relacionConPaciente: true } },
      },
    });
    res.status(201).json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** PATCH actualizar cita (estado, fecha/hora, observaciones) */
export const updateCita = async (req, res) => {
  try {
    const { estado, fechaHora, observaciones } = req.body;
    const data = {};
    if (estado !== undefined) data.estado = estado;
    if (fechaHora !== undefined) {
      const fh = new Date(fechaHora);
      if (!isNaN(fh.getTime())) data.fechaHora = fh;
    }
    if (observaciones !== undefined) data.observaciones = observaciones?.trim() || null;

    const item = await prisma.cita.update({
      where: { id: req.params.id },
      data,
      include: {
        paciente: { select: { id: true, nombre: true, apellidos: true } },
        visitante: { select: { id: true, nombre: true, apellidos: true, telefono: true, relacionConPaciente: true } },
      },
    });
    res.json({ data: item });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Cita no encontrada' });
    res.status(500).json({ message: error.message });
  }
};

/** DELETE eliminar cita */
export const deleteCita = async (req, res) => {
  try {
    await prisma.cita.delete({ where: { id: req.params.id } });
    res.json({ message: 'Cita eliminada' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Cita no encontrada' });
    res.status(500).json({ message: error.message });
  }
};
