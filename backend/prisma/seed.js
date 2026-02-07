import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@cracare.com' },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: 'admin@cracare.com',
        password: hashedPassword,
        nombre: 'Administrador',
        apellidos: 'CRACare',
        rol: 'ADMINISTRADOR',
        departamento: 'Dirección',
      },
    });
    console.log('Usuario administrador creado: admin@cracare.com / admin123');
  } else {
    console.log('Usuario administrador ya existe');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
