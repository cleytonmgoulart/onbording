import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pendenciasAbertas, percentualConclusao, prazoPendencias, situacaoPrazo } from "@/lib/resumo";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const onboarding = await prisma.onboarding.findUnique({
    where: { tokenCliente: params.token },
    include: {
      cliente: true,
      checklist: { include: { arquivos: true }, orderBy: { id: "asc" } },
      arquivos: true
    }
  });

  if (!onboarding) return NextResponse.json({ error: "Link inválido." }, { status: 404 });

  return NextResponse.json({
    ...onboarding,
    painel: {
      prazo: prazoPendencias(onboarding),
      pendenciasAbertas: pendenciasAbertas(onboarding.checklist),
      percentualConclusao: percentualConclusao(onboarding.checklist),
      situacaoPrazo: situacaoPrazo(onboarding, onboarding.checklist)
    }
  });
}
