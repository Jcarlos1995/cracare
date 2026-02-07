import { prisma } from '../config/database.js';
import { ROLES } from '../utils/roles.js';

const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/** OSS: residentes con baño hoy (según diaSemana 1-7, 1=Lunes). RAA: mismo + puede editar */
export const getActividades = async (req, res) => {
  try {
    const user = req.user;
    const wherePaciente = { activo: true };
    if (user.rol === ROLES.OSS && user.raaId) wherePaciente.raaId = user.raaId;
    if (user.rol === ROLES.RAA) wherePaciente.OR = [{ raaId: user.id }, { raaId: null }];

    const hoy = new Date();
    const diaSemanaHoy = hoy.getDay() === 0 ? 7 : hoy.getDay(); // Domingo=7, Lunes=1

    const banoSemanal = await prisma.banoSemanal.findMany({
      where: {
        paciente: wherePaciente,
      },
      include: {
        paciente: { select: { id: true, nombre: true, apellidos: true } },
      },
      orderBy: [{ diaSemana: 'asc' }, { paciente: { nombre: 'asc' } }],
    });
    const hoyList = banoSemanal.filter((b) => b.diaSemana === diaSemanaHoy).map((b) => b.paciente);
    const porDia = {};
    for (let d = 1; d <= 7; d++) porDia[d] = banoSemanal.filter((b) => b.diaSemana === d).map((b) => b.paciente);
    res.json({
      data: {
        diaSemanaHoy,
        diaNombreHoy: DIAS[diaSemanaHoy],
        residentesBanoHoy: hoyList,
        porDia,
        todos: banoSemanal,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** RAA: añadir o quitar baño semanal (pacienteId, diaSemana 1-7) */
export const setBano = async (req, res) => {
  try {
    if (req.user.rol !== ROLES.RAA) return res.status(403).json({ message: 'Solo la RAA puede modificar el baño semanal' });
    const { pacienteId, diaSemana } = req.body;
    const dia = Number(diaSemana);
    if (!pacienteId?.trim() || !dia || dia < 1 || dia > 7) return res.status(400).json({ message: 'pacienteId y diaSemana (1-7) son obligatorios' });

    const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
    if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
    if (paciente.raaId != null && paciente.raaId !== req.user.id) return res.status(403).json({ message: 'Solo puede asignar residentes de su planta o sin asignar' });

    const existing = await prisma.banoSemanal.findUnique({
      where: { pacienteId_diaSemana: { pacienteId, diaSemana: dia } },
    });
    if (existing) {
      await prisma.banoSemanal.delete({
        where: { pacienteId_diaSemana: { pacienteId, diaSemana: dia } },
      });
      return res.json({ data: { removed: true } });
    }
    const item = await prisma.banoSemanal.create({
      data: { pacienteId, diaSemana: dia },
      include: { paciente: { select: { id: true, nombre: true, apellidos: true } } },
    });
    res.status(201).json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/** RAA: listado completo (para edición) */
export const getAll = async (req, res) => {
  try {
    if (req.user.rol !== ROLES.RAA) return res.status(403).json({ message: 'Solo la RAA puede ver el listado completo' });
    const list = await prisma.banoSemanal.findMany({
      where: { paciente: { raaId: req.user.id } },
      include: { paciente: { select: { id: true, nombre: true, apellidos: true } } },
      orderBy: [{ diaSemana: 'asc' }, { paciente: { nombre: 'asc' } }],
    });
    res.json({ data: list });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
