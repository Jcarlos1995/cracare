import { prisma } from '../config/database.js';
import { ROLES } from '../utils/roles.js';

const TURNOS_CALENDARIO = ['MANANA_1', 'MANANA_2', 'TARDE_1', 'TARDE_2', 'GUARDIA'];

// RAA: obtener OSS de su equipo (para el calendario)
export const getMiEquipo = async (req, res) => {
  try {
    const oss = await prisma.user.findMany({
      where: { rol: ROLES.OSS, raaId: req.user.id, activo: true },
      select: { id: true, nombre: true, apellidos: true },
      orderBy: { nombre: 'asc' },
    });
    res.json({ data: oss });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RAA: obtener horarios de un mes
export const getHorariosMes = async (req, res) => {
  try {
    const { anio, mes } = req.query;
    const anioNum = Number(anio);
    const mesNum = Number(mes);
    if (!anioNum || !mesNum) return res.status(400).json({ message: 'anio y mes son obligatorios' });
    const start = new Date(anioNum, mesNum - 1, 1);
    const end = new Date(anioNum, mesNum, 0);
    const horarios = await prisma.horarioDia.findMany({
      where: {
        raaId: req.user.id,
        fecha: { gte: start, lte: end },
      },
      orderBy: { fecha: 'asc' },
    });
    res.json({ data: horarios });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// OSS: ver mis turnos asignados (por mes o por rango de fechas)
export const getMisTurnos = async (req, res) => {
  try {
    const { anio, mes } = req.query;
    const anioNum = Number(anio);
    const mesNum = Number(mes);
    if (!anioNum || !mesNum) return res.status(400).json({ message: 'anio y mes son obligatorios' });
    const start = new Date(anioNum, mesNum - 1, 1);
    const end = new Date(anioNum, mesNum, 0);
    const horarios = await prisma.horarioDia.findMany({
      where: { ossId: req.user.id, fecha: { gte: start, lte: end } },
      orderBy: { fecha: 'asc' },
    });
    res.json({ data: horarios });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RAA: guardar asignación de un día (varias asignaciones: turno -> ossId)
export const setHorarioDia = async (req, res) => {
  try {
    const { fecha, asignaciones } = req.body; // asignaciones: { MANANA_1: ossId, MANANA_2: ossId, ... }
    if (!fecha) return res.status(400).json({ message: 'fecha es obligatoria' });
    const raaId = req.user.id;
    const fechaDate = new Date(fecha);
    fechaDate.setHours(0, 0, 0, 0);
    const ossIds = await prisma.user.findMany({
      where: { rol: ROLES.OSS, raaId, activo: true },
      select: { id: true },
    }).then((r) => r.map((u) => u.id));
    for (const turno of TURNOS_CALENDARIO) {
      const ossId = asignaciones?.[turno]?.trim() || null;
      if (ossId && !ossIds.includes(ossId)) continue;
      const existing = await prisma.horarioDia.findUnique({
        where: { raaId_fecha_turno: { raaId, fecha: fechaDate, turno } },
      });
      if (ossId) {
        await prisma.horarioDia.upsert({
          where: { raaId_fecha_turno: { raaId, fecha: fechaDate, turno } },
          create: { raaId, fecha: fechaDate, ossId, turno },
          update: { ossId },
        });
      } else if (existing) {
        await prisma.horarioDia.delete({
          where: { raaId_fecha_turno: { raaId, fecha: fechaDate, turno } },
        });
      }
    }
    const horarios = await prisma.horarioDia.findMany({
      where: { raaId, fecha: fechaDate },
    });
    res.json({ data: horarios });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
