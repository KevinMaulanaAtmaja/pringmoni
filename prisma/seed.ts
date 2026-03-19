import "dotenv/config";
import { PrismaClient } from "./generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Check your .env file.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const users = [
    {
      username: "admin",
      email: "admin@example.com",
      role: "admin",
    },
    {
      username: "user",
      email: "user@example.com",
      role: "user",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        username: user.username,
        role: user.role,
      },
      create: {
        username: user.username,
        email: user.email,
        password,
        role: user.role,
      },
    });
  }

  console.log("Seed selesai: 2 user sudah siap di database.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
