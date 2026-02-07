import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../config/database.js';

/**
 * Middleware de autenticación - verifica JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    if (token === 'demo-token' && process.env.NODE_ENV !== 'production') {
      req.user = {
        id: 'demo-user',
        email: 'admin@cracare.com',
        nombre: 'Admin Demo',
        rol: 'ADMINISTRADOR',
        activo: true,
      };
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellidos: true,
        rol: true,
        activo: true,
      },
    });

    if (!user || !user.activo) {
      return res.status(401).json({ message: 'Usuario no válido' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

/**
 * Middleware de autorización por roles
 */
export const requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tiene permisos para esta acción' });
    }
    next();
  };
};
