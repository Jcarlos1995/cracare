import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { config } from './config/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { authenticate, requireRoles } from './middlewares/auth.middleware.js';
import { uploadContrato, uploadHojaClinica } from './config/upload.js';
import { login } from './controllers/auth.controller.js';
import { me } from './controllers/auth.controller.js';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadContratoPdf,
} from './controllers/user.controller.js';
import * as inventario from './controllers/inventario.controller.js';
import * as consigna from './controllers/consigna.controller.js';
import * as movimiento from './controllers/movimiento.controller.js';
import * as paciente from './controllers/paciente.controller.js';
import { getDashboard } from './controllers/dashboard.controller.js';
import { getReporteMensual, exportReporteExcel } from './controllers/reportes.controller.js';
import * as solicitudInsumo from './controllers/solicitudInsumo.controller.js';
import * as horario from './controllers/horario.controller.js';
import * as horarioEnfermera from './controllers/horarioEnfermera.controller.js';
import * as medicamentoPaciente from './controllers/medicamentoPaciente.controller.js';
import * as tratamientoPaciente from './controllers/tratamientoPaciente.controller.js';
import * as consignaPersonal from './controllers/consignaPersonal.controller.js';
import { ROLES } from './utils/roles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.post('/api/users/:id/contrato', authenticate, requireRoles([ROLES.ADMINISTRADOR]), uploadContrato, uploadContratoPdf);

const admin = [authenticate, requireRoles([ROLES.ADMINISTRADOR])];
const raa = [authenticate, requireRoles([ROLES.RAA])];
const ras = [authenticate, requireRoles([ROLES.RAS])];
const adminOrRaa = [authenticate, requireRoles([ROLES.ADMINISTRADOR, ROLES.RAA])];
const adminOrRaaOrRas = [authenticate, requireRoles([ROLES.ADMINISTRADOR, ROLES.RAA, ROLES.RAS])];
const adminOrRaaOrRasOrMedico = [authenticate, requireRoles([ROLES.ADMINISTRADOR, ROLES.RAA, ROLES.RAS, ROLES.MEDICO])];
const adminOrRaaOrRasOrMedicoOrEnfermera = [authenticate, requireRoles([ROLES.ADMINISTRADOR, ROLES.RAA, ROLES.RAS, ROLES.MEDICO, ROLES.ENFERMERA])];
const adminOrRas = [authenticate, requireRoles([ROLES.ADMINISTRADOR, ROLES.RAS])];
const adminOrRasOrMedicoOrEnfermera = [authenticate, requireRoles([ROLES.ADMINISTRADOR, ROLES.RAS, ROLES.MEDICO, ROLES.ENFERMERA])];
const adminOrMedico = [authenticate, requireRoles([ROLES.ADMINISTRADOR, ROLES.MEDICO])];

app.get('/api/dashboard', authenticate, getDashboard);

app.get('/api/inventario', admin, inventario.getInventario);
app.get('/api/inventario/:id', admin, inventario.getInventarioItem);
app.post('/api/inventario', admin, inventario.createInventario);
app.patch('/api/inventario/:id', admin, inventario.updateInventario);
app.delete('/api/inventario/:id', admin, inventario.deleteInventario);

app.get('/api/consignas', authenticate, consigna.getConsignas);
app.get('/api/consignas/:id', authenticate, consigna.getConsigna);
app.post('/api/consignas', authenticate, consigna.createConsigna);
app.patch('/api/consignas/:id', admin, consigna.updateConsigna);
app.delete('/api/consignas/:id', admin, consigna.deleteConsigna);

app.get('/api/movimientos', admin, movimiento.getMovimientos);
app.post('/api/movimientos', admin, movimiento.createMovimiento);
app.patch('/api/movimientos/:id', admin, movimiento.updateMovimiento);
app.delete('/api/movimientos/:id', admin, movimiento.deleteMovimiento);

app.get('/api/pacientes', adminOrRaaOrRasOrMedicoOrEnfermera, paciente.getPacientes);
app.get('/api/pacientes/:pacienteId/consignas-personales', adminOrRaaOrRasOrMedicoOrEnfermera, consignaPersonal.getByPaciente);
app.post('/api/pacientes/:pacienteId/consignas-personales', adminOrRaaOrRasOrMedicoOrEnfermera, consignaPersonal.create);
app.get('/api/pacientes/:id', adminOrRaaOrRasOrMedicoOrEnfermera, paciente.getPaciente);
app.post('/api/pacientes', adminOrRaa, paciente.createPaciente);
app.patch('/api/pacientes/:id', adminOrRaa, paciente.updatePaciente);
app.delete('/api/pacientes/:id', adminOrRaa, paciente.deletePaciente);
app.post('/api/pacientes/:id/hoja-clinica', adminOrRaa, uploadHojaClinica, paciente.uploadHojaClinica);

app.get('/api/pacientes/:pacienteId/medicamentos', adminOrRasOrMedicoOrEnfermera, medicamentoPaciente.getByPaciente);
app.post('/api/pacientes/:pacienteId/medicamentos', adminOrRasOrMedicoOrEnfermera, medicamentoPaciente.create);
app.patch('/api/medicamentos/:id', adminOrRasOrMedicoOrEnfermera, medicamentoPaciente.update);
app.delete('/api/medicamentos/:id', adminOrRasOrMedicoOrEnfermera, medicamentoPaciente.remove);

app.get('/api/medicaciones', adminOrRasOrMedicoOrEnfermera, medicamentoPaciente.getGrid);
app.get('/api/diario-medicaciones', adminOrRasOrMedicoOrEnfermera, medicamentoPaciente.getDiarioMedicaciones);

app.get('/api/pacientes/:pacienteId/tratamientos', adminOrRasOrMedicoOrEnfermera, tratamientoPaciente.getByPaciente);
app.post('/api/pacientes/:pacienteId/tratamientos', adminOrRasOrMedicoOrEnfermera, tratamientoPaciente.create);
app.patch('/api/tratamientos/:id', adminOrRasOrMedicoOrEnfermera, tratamientoPaciente.update);
app.delete('/api/tratamientos/:id', adminOrRasOrMedicoOrEnfermera, tratamientoPaciente.remove);

app.get('/api/solicitudes-insumo', authenticate, (req, res, next) => {
  if (req.user.rol === ROLES.RAA || req.user.rol === ROLES.RAS) return solicitudInsumo.getMisSolicitudes(req, res, next);
  if (req.user.rol === ROLES.ADMINISTRADOR) return solicitudInsumo.getTodasSolicitudes(req, res, next);
  return res.status(403).json({ message: 'No autorizado' });
});
app.post('/api/solicitudes-insumo', authenticate, requireRoles([ROLES.RAA, ROLES.RAS]), solicitudInsumo.createSolicitud);
app.patch('/api/solicitudes-insumo/:id/estado', admin, solicitudInsumo.updateEstadoSolicitud);
app.patch('/api/solicitudes-insumo/:id/completada', authenticate, requireRoles([ROLES.RAA, ROLES.RAS]), solicitudInsumo.marcarCompletada);

app.get('/api/horarios/equipo', raa, horario.getMiEquipo);
app.get('/api/horarios/mes', raa, horario.getHorariosMes);
app.post('/api/horarios/dia', raa, horario.setHorarioDia);

app.get('/api/horarios-enfermera/equipo', ras, horarioEnfermera.getMiEquipo);
app.get('/api/horarios-enfermera/mes', ras, horarioEnfermera.getHorariosMes);
app.post('/api/horarios-enfermera/dia', ras, horarioEnfermera.setHorarioDia);

app.get('/api/diario-unificado', authenticate, consignaPersonal.getDiarioUnificado);

app.get('/api/reportes/mensual', admin, getReporteMensual);
app.get('/api/reportes/export', admin, exportReporteExcel);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`CRACare API escuchando en http://localhost:${config.port}`);
});
