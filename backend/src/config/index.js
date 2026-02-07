import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  jwt: {
    secret: process.env.JWT_SECRET || 'secret-dev',
    expiresIn: process.env.JWT_EXPIRES || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
