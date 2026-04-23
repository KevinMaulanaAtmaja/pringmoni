import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  // for (const user of users) {
  //   await prisma.users.upsert({
  //     where: {
  //       email: users.email,
  //     },
  //     update: {
  //       username: users.username,
  //       role: users.role,
  //     },
  //     create: {
  //       username: users.username,
  //       email: users.email,
  //       password,
  //       role: users.role,
  //     },
  //   });
  // }

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
