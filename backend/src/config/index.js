import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: process.env.PORT || 4000,
  jwt: {
    secret: process.env.JWT_SECRET || 'secret-dev',
    expiresIn: process.env.JWT_EXPIRES || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  /** Base dir for uploads; in Firebase set to /tmp (e.g. /tmp/cracare-uploads). */
  uploadsDir: process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads'),
};
