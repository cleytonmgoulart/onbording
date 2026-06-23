import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { STATUS_ONBOARDING } from "@/lib/checklist";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  const body = await request.json();
  const statusNovo = String(body.status ?? "");
  const observacao = String(body.observacao ?? "").trim() || null;

  if (!STATUS_ONBOARDING.includes(statusNovo)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const atual = await prisma.onboarding.findUnique({ where: { id: Number(params.id) } });
  if (!atual) return NextResponse.json({ error: "Onboarding não encontrado." }, { status: 404 });

  const onboarding = await prisma.onboarding.update({
    where: { id: atual.id },
    data: {
      status: statusNovo,
      historicoStatus: {
        create: { statusAnterior: atual.status, statusNovo, usuarioId: user.id, observacao }
      },
      logs: {
        create: { usuarioId: user.id, acao: "onboarding.status", detalhes: `${atual.status} -> ${statusNovo}` }
      }
    }
  });

  return NextResponse.json(onboarding);
}
