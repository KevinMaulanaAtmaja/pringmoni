"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import sharp from "sharp"
import { v4 as uuidv4 } from "uuid"

export async function uploadMenuFoto(menuId: number, formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'owner') {
    return { error: "Unauthorized" }
  }

  const file = formData.get("foto") as File
  if (!file || file.size === 0) {
    return { error: "Pilih file gambar terlebih dahulu" }
  }

  // Check file type
  if (!file.type.startsWith("image/")) {
    return { error: "File harus berupa gambar" }
  }

  // Check file size (max 5MB before compression)
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Ukuran file maksimal 5MB" }
  }

  try {
    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Compress and resize image using sharp
    const compressedBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()

     // Upload to UploadThing
     const formDataUpload = new FormData()
     
     // Convert Buffer to ArrayBuffer for Blob compatibility
     const arrayBuffer = compressedBuffer.buffer.slice(
       compressedBuffer.byteOffset,
       compressedBuffer.byteOffset + compressedBuffer.byteLength
     ) as ArrayBuffer;
     
     formDataUpload.append("file", new Blob([arrayBuffer], { type: "image/jpeg" }), `menu-${menuId}-${uuidv4()}.jpg`)
    
    const uploadResponse = await fetch("https://uploadthing.com/api/upload", {
      method: "POST",
      headers: {
        "X-Uploadthing-Api-Key": process.env.UPLOADTHING_SECRET || '',
      },
      body: formDataUpload,
    })

    if (!uploadResponse.ok) {
      return { error: "Gagal upload ke UploadThing" }
    }

    const uploadResult = await uploadResponse.json()
    const fotoUrl = uploadResult?.fileUrl || ''

    if (!fotoUrl) {
      return { error: "Gagal mendapatkan URL gambar" }
    }

    // Get current highest urutan
    const maxUrutan = await prisma.$queryRaw<Array<{ max_urutan: number }>>`
      SELECT COALESCE(MAX(urutan), 0) as max_urutan 
      FROM menu_foto 
      WHERE menu_id = ${menuId}
    `
    const urutan = (maxUrutan[0]?.max_urutan || 0) + 1

    // Save to database
    await prisma.$executeRaw`
      INSERT INTO menu_foto (menu_id, foto_url, urutan)
      VALUES (${menuId}, ${fotoUrl}, ${urutan})
    `

    revalidatePath("/dashboard/menu")
    return { success: true, fotoUrl }
  } catch (error) {
    console.error("Upload error:", error)
    return { error: "Gagal mengupload gambar" }
  }
}
