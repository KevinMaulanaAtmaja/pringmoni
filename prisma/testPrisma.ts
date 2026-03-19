import "dotenv/config";
import { PrismaClient } from "./generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is missing. Check your .env file.");
}

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
});

async function main() {
    const users = await prisma.user.findMany();
    console.log(users);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
