import 'dotenv/config';
import { NestFactory } from '@nestjs/core';

import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const scrypt = promisify(_scrypt);

async function main() {
  const app = await NestFactory.createApplicationContext(PrismaModule);
  const prisma = app.get(PrismaService);

  try {
    console.log('🌱 Iniciando seed...');

    const statuses = [
      {
        id: 0,
        name: 'PENDING',
      },
      {
        id: 1,
        name: 'EXTRACTING',
      },
      {
        id: 2,
        name: 'EXTRACTED',
      },
      {
        id: 3,
        name: 'ERROR',
      },
    ];

    for (const status of statuses) {
      await prisma.status.upsert({
        where: { id: status.id },
        update: {
          name: status.name,
        },
        create: status,
      });
    }

    // Usuários para adicionar
    const users = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Elisangela das Neves',
      },
      {
        email: 'user@example.com',
        password: 'user123',
        name: 'Maria do Carmo',
      },
    ];

    for (const u of users) {
      const salt = randomBytes(8).toString('hex');

      const key = (await scrypt(u.password, salt, 32)) as Buffer;

      const passwordHash = `${salt}.${key.toString('hex')}`;

      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          email: u.email,
          password: passwordHash,
          name: u.name,
        },
      });
    }

    console.log('🌱 Seed finalizado com sucesso!');
  } finally {
    await prisma.$disconnect();
    await app.close();
  }
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
