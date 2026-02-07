import { prisma } from '../config/database.js';
import { ROLES } from '../utils/roles.js';

export const getDashboard = async (req, res) => {
  try {
    const user = req.user;
    if (user.rol === ROLES.ADMINISTRADOR) {
      const [profesionalesCount, pacientesCount, solicitudes] = await Promise.all([
        prisma.user.count({ where: { activo: true } }),
        prisma.paciente.count({ where: { activo: true } }),
        prisma.solicitudInsumo.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { solicitante: { select: { nombre: true, apellidos: true, rol: true } } },
        }),
      ]);
      return res.json({
        data: {
          profesionalesContratados: profesionalesCount,
          pacientesRegistrados: pacientesCount,
          solicitudesInsumo: solicitudes,
        },
      });
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
    res.json({ data: {} });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
