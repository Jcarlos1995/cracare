import { prisma } from '../config/database.js';
import { ROLES } from '../utils/roles.js';

const TURNOS = ['MANANA_1', 'MANANA_2', 'MANANA_3', 'TARDE_1', 'TARDE_2'];

export const getMiEquipo = async (req, res) => {
  try {
    const enfermeras = await prisma.user.findMany({
      where: { rol: ROLES.ENFERMERA, rasId: req.user.id, activo: true },
      select: { id: true, nombre: true, apellidos: true },
      orderBy: { nombre: 'asc' },
    });
    res.json({ data: enfermeras });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHorariosMes = async (req, res) => {
  try {
    const { anio, mes } = req.query;
    const anioNum = Number(anio);
    const mesNum = Number(mes);
    if (!anioNum || !mesNum) return res.status(400).json({ message: 'anio y mes son obligatorios' });
    const start = new Date(anioNum, mesNum - 1, 1);
    const end = new Date(anioNum, mesNum, 0);
    const horarios = await prisma.horarioEnfermeraDia.findMany({
      where: {
        rasId: req.user.id,
        fecha: { gte: start, lte: end },
      },
      orderBy: { fecha: 'asc' },
    });
    res.json({ data: horarios });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setHorarioDia = async (req, res) => {
  try {
    const { fecha, asignaciones } = req.body;
    if (!fecha) return res.status(400).json({ message: 'fecha es obligatoria' });
    const rasId = req.user.id;
    const fechaDate = new Date(fecha);
    fechaDate.setHours(0, 0, 0, 0);
    const enfermeraIds = await prisma.user.findMany({
      where: { rol: ROLES.ENFERMERA, rasId, activo: true },
      select: { id: true },
    }).then((r) => r.map((u) => u.id));
    for (const turno of TURNOS) {
      const enfermeraId = asignaciones?.[turno]?.trim() || null;
      if (enfermeraId && !enfermeraIds.includes(enfermeraId)) continue;
      const existing = await prisma.horarioEnfermeraDia.findUnique({
        where: { rasId_fecha_turno: { rasId, fecha: fechaDate, turno } },
      });
      if (enfermeraId) {
        await prisma.horarioEnfermeraDia.upsert({
          where: { rasId_fecha_turno: { rasId, fecha: fechaDate, turno } },
          create: { rasId, fecha: fechaDate, enfermeraId, turno },
          update: { enfermeraId },
        });
      } else if (existing) {
        await prisma.horarioEnfermeraDia.delete({
          where: { rasId_fecha_turno: { rasId, fecha: fechaDate, turno } },
        });
      }
    }
    const horarios = await prisma.horarioEnfermeraDia.findMany({
      where: { rasId, fecha: fechaDate },
    });
    res.json({ data: horarios });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
