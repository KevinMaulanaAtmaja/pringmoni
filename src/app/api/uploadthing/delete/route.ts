import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';
import { auth } from "@/lib/auth"

const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
});

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json();
    const { fileKey } = body;

    if (!fileKey) {
      return NextResponse.json(
        { error: 'fileKey is required' },
        { status: 400 }
      );
    }

    // Delete file from UploadThing
    await utapi.deleteFiles(fileKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
