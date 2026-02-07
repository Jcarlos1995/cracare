import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { ROLES, ROLE_LABELS } from '../utils/roles.js';

const SALT_ROUNDS = 10;

const userSelect = {
  id: true,
  email: true,
  nombre: true,
  apellidos: true,
  dniNif: true,
  telefono: true,
  rol: true,
  activo: true,
  numColegiado: true,
  especialidad: true,
  certificacionOss: true,
  turno: true,
  rasId: true,
  raaId: true,
  departamento: true,
  fechaAlta: true,
  createdAt: true,
};

const validRoles = Object.values(ROLES);

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: userSelect,
      orderBy: { nombre: 'asc' },
    });
    res.json({ data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: userSelect,
    });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      nombre,
      apellidos,
      dniNif,
      telefono,
      rol,
      numColegiado,
      especialidad,
      certificacionOss,
      turno,
      departamento,
      rasId,
      raaId,
    } = req.body;

    if (!email?.trim() || !password?.trim() || !nombre?.trim()) {
      return res.status(400).json({ message: 'Email, contraseña y nombre son obligatorios' });
    }

    if (!validRoles.includes(rol)) {
      return res.status(400).json({ message: `Rol inválido. Use: ${validRoles.join(', ')}` });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email' });
    }

    // Validar jefaturas: Enfermera -> RAS, OSS -> RAA
    if (rol === ROLES.ENFERMERA && rasId) {
      const ras = await prisma.user.findFirst({
        where: { id: rasId, rol: ROLES.RAS, activo: true },
      });
      if (!ras) {
        return res.status(400).json({ message: 'rasId debe ser un usuario RAS activo' });
      }
    }
    if (rol === ROLES.OSS && raaId) {
      const raa = await prisma.user.findFirst({
        where: { id: raaId, rol: ROLES.RAA, activo: true },
      });
      if (!raa) {
        return res.status(400).json({ message: 'raaId debe ser un usuario RAA activo' });
      }
    }

    const hashedPassword = await bcrypt.hash(password.trim(), SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        nombre: nombre.trim(),
        apellidos: apellidos?.trim() || null,
        dniNif: dniNif?.trim() || null,
        telefono: telefono?.trim() || null,
        rol,
        numColegiado: numColegiado?.trim() || null,
        especialidad: especialidad?.trim() || null,
        certificacionOss: certificacionOss?.trim() || null,
        turno: turno || null,
        rasId: rol === ROLES.ENFERMERA ? (rasId?.trim() || null) : null,
        raaId: rol === ROLES.OSS ? (raaId?.trim() || null) : null,
        departamento: departamento?.trim() || null,
        fechaAlta: new Date(),
      },
      select: userSelect,
    });

    res.status(201).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const {
      nombre,
      apellidos,
      dniNif,
      telefono,
      rol,
      numColegiado,
      especialidad,
      certificacionOss,
      turno,
      departamento,
      password,
      activo,
      rasId,
      raaId,
    } = req.body;
    const id = req.params.id;

    const data = {};
    if (nombre !== undefined) data.nombre = nombre.trim();
    if (apellidos !== undefined) data.apellidos = apellidos?.trim() || null;
    if (dniNif !== undefined) data.dniNif = dniNif?.trim() || null;
    if (telefono !== undefined) data.telefono = telefono?.trim() || null;
    if (rol !== undefined) {
      if (!validRoles.includes(rol)) {
        return res.status(400).json({ message: `Rol inválido. Use: ${validRoles.join(', ')}` });
      }
      data.rol = rol;
    }
    if (numColegiado !== undefined) data.numColegiado = numColegiado?.trim() || null;
    if (especialidad !== undefined) data.especialidad = especialidad?.trim() || null;
    if (certificacionOss !== undefined) data.certificacionOss = certificacionOss?.trim() || null;
    if (turno !== undefined) data.turno = turno || null;
    if (departamento !== undefined) data.departamento = departamento?.trim() || null;
    if (activo !== undefined) data.activo = Boolean(activo);
    if (rasId !== undefined || raaId !== undefined) {
      const existing = await prisma.user.findUnique({ where: { id }, select: { rol: true } });
      if (!existing) return res.status(404).json({ message: 'Usuario no encontrado' });
      const finalRol = data.rol ?? existing.rol;
      if (rasId !== undefined) {
        data.rasId = finalRol === ROLES.ENFERMERA ? (rasId?.trim() || null) : null;
        if (data.rasId) {
          const ras = await prisma.user.findFirst({ where: { id: data.rasId, rol: ROLES.RAS, activo: true } });
          if (!ras) return res.status(400).json({ message: 'rasId debe ser un usuario RAS activo' });
        }
      }
      if (raaId !== undefined) {
        data.raaId = finalRol === ROLES.OSS ? (raaId?.trim() || null) : null;
        if (data.raaId) {
          const raa = await prisma.user.findFirst({ where: { id: data.raaId, rol: ROLES.RAA, activo: true } });
          if (!raa) return res.status(400).json({ message: 'raaId debe ser un usuario RAA activo' });
        }
      }
    }
    if (password?.trim()) {
      data.password = await bcrypt.hash(password.trim(), SALT_ROUNDS);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });

    res.json({ data: user });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    if (id === req.user.id) {
      return res.status(400).json({ message: 'No puedes desactivar tu propio usuario' });
    }

    await prisma.user.update({
      where: { id },
      data: { activo: false },
    });

    res.json({ message: 'Usuario desactivado' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(500).json({ message: error.message });
  }
};
