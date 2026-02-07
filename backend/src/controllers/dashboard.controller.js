import { prisma } from '../config/database.js';
import { ROLES } from '../utils/roles.js';

export const getDashboard = async (req, res) => {
  try {
    const user = req.user;
    if (user.rol === ROLES.ADMINISTRADOR) {
      const now = new Date();
      now.setSeconds(0, 0);
      const [profesionalesCount, pacientesCount, solicitudes, citasRegistradas] = await Promise.all([
        prisma.user.count({ where: { activo: true } }),
        prisma.paciente.count({ where: { activo: true } }),
        prisma.solicitudInsumo.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { solicitante: { select: { nombre: true, apellidos: true, rol: true } } },
        }),
        prisma.cita.findMany({
          where: { fechaHora: { gte: now }, estado: 'AGENDADA' },
          include: {
            paciente: { select: { id: true, nombre: true, apellidos: true } },
            visitante: { select: { id: true, nombre: true, apellidos: true, telefono: true, relacionConPaciente: true } },
          },
          orderBy: { fechaHora: 'asc' },
          take: 100,
        }),
      ]);
      return res.json({
        data: {
          profesionalesContratados: profesionalesCount,
          pacientesRegistrados: pacientesCount,
          solicitudesInsumo: solicitudes,
          citasRegistradas,
        },
      });
    }
    if (user.rol === ROLES.RECEPCIONISTA) {
      const now = new Date();
      now.setSeconds(0, 0);
      const citasAgendadas = await prisma.cita.findMany({
        where: { fechaHora: { gte: now }, estado: 'AGENDADA' },
        include: {
          paciente: { select: { id: true, nombre: true, apellidos: true } },
          visitante: { select: { id: true, nombre: true, apellidos: true, telefono: true, relacionConPaciente: true } },
        },
        orderBy: { fechaHora: 'asc' },
        take: 100,
      });
      return res.json({ data: { citasAgendadas } });
    }
    if (user.rol === ROLES.RAA) {
      const ossEnEquipo = await prisma.user.count({
        where: { rol: ROLES.OSS, raaId: user.id, activo: true },
      });
      return res.json({ data: { ossEnEquipo } });
    }
    if (user.rol === ROLES.RAS) {
      const enfermerasEnEquipo = await prisma.user.count({
        where: { rol: ROLES.ENFERMERA, rasId: user.id, activo: true },
      });
      return res.json({ data: { enfermerasEnEquipo } });
    }
    if (user.rol === ROLES.FISIOTERAPEUTA) {
      const [terapiasPendientes, terapiasEfectuadas] = await Promise.all([
        prisma.terapiaRehabilitacion.findMany({
          where: { efectuada: false },
          include: { paciente: { select: { id: true, nombre: true, apellidos: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
        prisma.terapiaRehabilitacion.findMany({
          where: { efectuada: true },
          include: { paciente: { select: { id: true, nombre: true, apellidos: true } } },
          orderBy: { efectuadoAt: 'desc' },
          take: 50,
        }),
      ]);
      return res.json({ data: { terapiasPendientes, terapiasEfectuadas } });
    }
    res.json({ data: {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
