import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

(async () => {
  try {
    const menus = await p.menu.findMany({ take: 3, select: { id: true, namaMenu: true } });
    const kategori = await p.kategoriMenu.findMany({ take: 3, select: { id: true, namaKategori: true, lokasi: true } });
    const meja = await p.meja.findMany({ take: 3 });
    console.log("OK");
    console.log("menus:", JSON.stringify(menus));
    console.log("kategori:", JSON.stringify(kategori));
    console.log("meja count:", meja.length);
  } catch (e) {
    console.log("ERROR:");
    console.log((e as Error).message);
  } finally {
    await p.$disconnect();
  }
})();
