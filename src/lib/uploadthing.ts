import { createUploadthing, UTApi } from "uploadthing/server";
import type { FileRouter } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  menuFoto: f({ image: { maxFileSize: "4MB", maxFileCount: 5 } })
    .onUploadComplete(({ file }) => {
      console.log("Upload complete:", file.url, "key:", file.key);
      return { 
        success: true,
        url: file.url,
        key: file.key
      };
    }),
} as FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// Initialize UTApi with token from env
export const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
});
