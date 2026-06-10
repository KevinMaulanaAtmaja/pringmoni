'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';

async function requireOwner() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') throw new Error("Unauthorized")
}

export async function saveMenuFotoUrls(menuId: number, urls: string[], fileKeys: string[]) {
  await requireOwner()
  console.log('Saving foto URLs:', { menuId, urls, fileKeys });
  for (let i = 0; i < urls.length; i++) {
    await prisma.menuFoto.create({
      data: {
        menuId,
        fotoUrl: urls[i],
        fileKey: fileKeys[i] || null,
        urutan: i + 1,
      },
    });
  }
  revalidatePath('/dashboard/menu');
}

export async function deleteMenuFoto(fotoId: number) {
  await requireOwner()
  const foto = await prisma.menuFoto.findUnique({
    where: { id: fotoId },
  });

  if (!foto) {
    throw new Error('Foto tidak ditemukan');
  }

  console.log('Deleting foto:', { fotoId, fileKey: foto.fileKey, fotoUrl: foto.fotoUrl });

  // Delete from UploadThing using fileKey
  if (foto.fileKey) {
    try {
      const { UTApi } = await import('uploadthing/server');
      const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });
      console.log('Attempting to delete file with key:', foto.fileKey);
      const result = await utapi.deleteFiles(foto.fileKey);
      console.log('Delete result:', result);
    } catch (error) {
      console.error('Delete from UploadThing failed:', error);
    }
  } else {
    console.warn('No fileKey found for foto:', fotoId);
  }

  // Delete from database
  await prisma.menuFoto.delete({
    where: { id: fotoId },
  });

  revalidatePath('/dashboard/menu');
}

export async function getMenuFotos(menuId: number) {
  await requireOwner()
  return await prisma.menuFoto.findMany({
    where: { menuId },
    orderBy: { urutan: 'asc' },
  });
}

// Delete all fotos for a menu (used when deleting menu)
export async function deleteAllMenuFotos(menuId: number) {
  await requireOwner()
  const fotos = await prisma.menuFoto.findMany({
    where: { menuId },
  });

  console.log('Deleting all fotos for menu:', { menuId, count: fotos.length });

  // Delete from UploadThing using fileKeys
  const fileKeys = fotos.filter(f => f.fileKey).map(f => f.fileKey!);
  if (fileKeys.length > 0) {
    try {
      const { UTApi } = await import('uploadthing/server');
      const utapi = new UTApi({ token: process.env.UPLOADTHING_TOKEN });
      console.log('Attempting to delete files with keys:', fileKeys);
      const result = await utapi.deleteFiles(fileKeys);
      console.log('Delete all result:', result);
    } catch (error) {
      console.error('Delete from UploadThing failed:', error);
    }
  }

  await prisma.menuFoto.deleteMany({
    where: { menuId },
  });
}
