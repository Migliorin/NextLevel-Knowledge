import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { randomBytes, scrypt as _scrypt} from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed...')

  // Usuários para adicionar
  const users = [
    {
      email: "admin@example.com",
      password: "admin123",
      name: "Elisangela das Neves"
    },
    {
      email: "user@example.com",
      password: "user123",
      name: "Maria do Carmo"
    }
  ]

  for (const u of users) {
    const salt = randomBytes(8).toString('hex');

    const key = await scrypt(u.password,salt,32) as Buffer;

    const passwordHash = `${salt}.${key.toString('hex')}`;

    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: passwordHash,
        name: u.name,
      }
    })
  }

  console.log('🌱 Seed finalizado com sucesso!')
}

main()
.then(async () => {
  await prisma.$disconnect();
  await pool.end();
})
.catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});
