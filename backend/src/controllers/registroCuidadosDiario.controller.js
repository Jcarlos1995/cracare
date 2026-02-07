import { prisma } from '../config/database.js';
import { ROLES } from '../utils/roles.js';

/** OSS: lista de residentes de su RAA con registro de cuidados del día (por fecha) */
export const getByFecha = async (req, res) => {
  try {
    const { fecha } = req.query;
    const fechaDate = fecha ? new Date(fecha) : new Date();
    fechaDate.setHours(0, 0, 0, 0);
    const user = req.user;
    const wherePaciente = {};
    if (user.rol === ROLES.OSS && user.raaId) wherePaciente.raaId = user.raaId;
    if (user.rol === ROLES.RAA) wherePaciente.raaId = user.id;
    const pacientes = await prisma.paciente.findMany({
      where: { ...wherePaciente, activo: true },
      orderBy: { nombre: 'asc' },
    });
    const registros = await prisma.registroCuidadosDiario.findMany({
      where: {
        fecha: fechaDate,
        pacienteId: { in: pacientes.map((p) => p.id) },
      },
      include: {
        registradoPor: { select: { id: true, nombre: true, apellidos: true } },
      },
    });
    const mapReg = Object.fromEntries(registros.map((r) => [r.pacienteId, r]));
    const list = pacientes.map((p) => ({
      paciente: p,
      registro: mapReg[p.id] || null,
    }));
    res.json({ data: list, fecha: fechaDate.toISOString().slice(0, 10) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** OSS/RAA: upsert registro de cuidados de un paciente en una fecha */
export const upsert = async (req, res) => {
  try {
    const { pacienteId, fecha, desayunado, almorzado, merendado, cenado, evacuado, evacuadoAlvo, dormido, hidratado } = req.body;
    if (!pacienteId?.trim()) return res.status(400).json({ message: 'pacienteId es obligatorio' });
    const user = req.user;
    const fechaDate = fecha ? new Date(fecha) : new Date();
    fechaDate.setHours(0, 0, 0, 0);

    const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    if (user.rol === ROLES.OSS && paciente.raaId !== user.raaId) return res.status(403).json({ message: 'No autorizado' });
    if (user.rol === ROLES.RAA && paciente.raaId !== user.id) return res.status(403).json({ message: 'No autorizado' });
    if (user.rol !== ROLES.OSS && user.rol !== ROLES.RAA) return res.status(403).json({ message: 'Solo OSS o RAA pueden registrar cuidados' });

    const data = {
      desayunado: Boolean(desayunado),
      almorzado: Boolean(almorzado),
      merendado: Boolean(merendado),
      cenado: Boolean(cenado),
      evacuado: Boolean(evacuado),
      evacuadoAlvo: Boolean(evacuadoAlvo),
      dormido: Boolean(dormido),
      hidratado: Boolean(hidratado),
      registradoPorId: user.id,
    };
    const item = await prisma.registroCuidadosDiario.upsert({
      where: {
        pacienteId_fecha: { pacienteId, fecha: fechaDate },
      },
      create: {
        pacienteId,
        fecha: fechaDate,
        ...data,
      },
      update: data,
      include: {
        paciente: { select: { id: true, nombre: true, apellidos: true } },
        registradoPor: { select: { id: true, nombre: true, apellidos: true } },
      },
    });
    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
