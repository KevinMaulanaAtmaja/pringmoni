import { redirect } from "next/navigation";

export default async function PembayaranRedirectPage({
  params,
}: {
  params: Promise<{ tokenMeja: string }>;
}) {
  const { tokenMeja } = await params;
  redirect(`/${tokenMeja}/checkout`);
}
