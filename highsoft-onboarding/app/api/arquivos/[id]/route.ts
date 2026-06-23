import fs from "fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { absoluteFromRelative } from "@/lib/files";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  const arquivo = await prisma.arquivo.findUnique({ where: { id: Number(params.id) } });
  if (!arquivo) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });

  const absolute = absoluteFromRelative(arquivo.caminhoRelativo);
  const data = await fs.readFile(absolute);

  return new NextResponse(data, {
    headers: {
      "Content-Type": arquivo.mimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(arquivo.nomeOriginal)}"`
    }
  });
}
