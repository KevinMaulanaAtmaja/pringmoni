import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

(async () => {
  try {
    const meja = await p.meja.findMany({ select: { id: true, nomorMeja: true, tokenMeja: true } });
    console.log(JSON.stringify(meja, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await p.$disconnect();
  }
})();
