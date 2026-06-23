import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { STATUS_VALIDACAO } from "@/lib/checklist";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  const id = Number(params.id);
  const onboarding = await prisma.onboarding.findUnique({
    where: { id },
    include: {
      cliente: true,
      checklist: { include: { arquivos: true }, orderBy: { id: "asc" } },
      arquivos: { orderBy: { criadoEm: "desc" } },
      historicoStatus: { orderBy: { criadoEm: "desc" }, include: { usuario: true } }
    }
  });
  if (!onboarding) return NextResponse.json({ error: "Onboarding não encontrado." }, { status: 404 });
  return NextResponse.json(onboarding);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  const body = await request.json();
  const fileId = Number(body.fileId);
  const statusValidacao = String(body.statusValidacao ?? "");

  if (!STATUS_VALIDACAO.includes(statusValidacao)) {
    return NextResponse.json({ error: "Status de validação inválido." }, { status: 400 });
  }

  const existente = await prisma.arquivo.findFirst({
    where: { id: fileId, onboardingId: Number(params.id) }
  });

  if (!existente) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });

  const arquivo = await prisma.arquivo.update({
    where: { id: fileId },
    data: {
      statusValidacao,
      observacaoValidacao: String(body.observacaoValidacao ?? "").trim() || null
    }
  });

  return NextResponse.json(arquivo);
}
