import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from './index.js';

const baseUploads = config.uploadsDir;
const contratosDir = path.join(baseUploads, 'contratos');
const hojasDir = path.join(baseUploads, 'hojas-clinicas');
try {
  fs.mkdirSync(contratosDir, { recursive: true });
  fs.mkdirSync(hojasDir, { recursive: true });
} catch (_) {}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, contratosDir),
  filename: (req, file, cb) => {
    const userId = req.params.id;
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `${userId}${ext}`);
  },
});

export const uploadContrato = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Solo se permiten archivos PDF'));
  },
}).single('contrato');

const storageHoja = multer.diskStorage({
  destination: (req, file, cb) => cb(null, hojasDir),
  filename: (req, file, cb) => {
    const pacienteId = req.params.id;
    cb(null, `${pacienteId}${path.extname(file.originalname) || '.pdf'}`);
  },
});

export const uploadHojaClinica = multer({
  storage: storageHoja,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(new Error('Solo se permiten archivos PDF'));
  },
}).single('hojaClinica');
