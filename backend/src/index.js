import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { authenticate, requireRoles } from './middlewares/auth.middleware.js';
import { login } from './controllers/auth.controller.js';
import { me } from './controllers/auth.controller.js';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from './controllers/user.controller.js';
import { ROLES } from './utils/roles.js';

const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());

// Salud / raíz
app.get('/', (req, res) => {
  res.json({ name: 'CRACare API', version: '1.0.0' });
});

// Auth (público)
app.post('/api/auth/login', login);

// Rutas protegidas
app.get('/api/auth/me', authenticate, me);

// Usuarios (solo Administrador puede listar/crear/editar/desactivar)
app.get('/api/users', authenticate, requireRoles([ROLES.ADMINISTRADOR]), getUsers);
app.get('/api/users/:id', authenticate, requireRoles([ROLES.ADMINISTRADOR]), getUser);
app.post('/api/users', authenticate, requireRoles([ROLES.ADMINISTRADOR]), createUser);
app.patch('/api/users/:id', authenticate, requireRoles([ROLES.ADMINISTRADOR]), updateUser);
app.delete('/api/users/:id', authenticate, requireRoles([ROLES.ADMINISTRADOR]), deleteUser);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`CRACare API escuchando en http://localhost:${config.port}`);
});
