"use client";

import { generateReactHelpers, generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "./uploadthing";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();

// Use type assertion to fix generic inference issue in UploadThing v7
export const UploadButton = generateUploadButton<OurFileRouter>() as React.FC<{
  endpoint: keyof OurFileRouter;
  onClientUploadComplete?: (res: { url: string; key: string }[]) => void;
  onUploadError?: (error: Error) => void;
  [key: string]: unknown;
}>;
