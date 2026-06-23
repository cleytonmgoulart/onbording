import fs from "fs/promises";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { quantidadeArquivosObrigatoria } from "@/lib/checklist";
import { absoluteFromRelative } from "@/lib/files";

export async function DELETE(_: Request, { params }: { params: { token: string; id: string } }) {
  const onboarding = await prisma.onboarding.findUnique({
    where: { tokenCliente: params.token },
    include: { checklist: true }
  });

  if (!onboarding) return NextResponse.json({ error: "Link invalido." }, { status: 404 });
  if (onboarding.finalizadoCliente || onboarding.bloqueadoParaCliente) {
    return NextResponse.json({ error: "Envio finalizado. Exclusao bloqueada." }, { status: 403 });
  }

  const arquivo = await prisma.arquivo.findFirst({
    where: {
      id: Number(params.id),
      onboardingId: onboarding.id,
      enviadoPor: "cliente"
    }
  });

  if (!arquivo) return NextResponse.json({ error: "Arquivo nao encontrado." }, { status: 404 });

  await prisma.arquivo.delete({ where: { id: arquivo.id } });

  try {
    await fs.unlink(absoluteFromRelative(arquivo.caminhoRelativo));
  } catch (error: any) {
    if (error?.code !== "ENOENT") throw error;
  }

  if (arquivo.checklistRespostaId) {
    const arquivosRestantes = await prisma.arquivo.count({
      where: {
        checklistRespostaId: arquivo.checklistRespostaId,
        onboardingId: onboarding.id
      }
    });

    const checklist = onboarding.checklist.find((item) => item.id === arquivo.checklistRespostaId);
    const quantidadeObrigatoria = quantidadeArquivosObrigatoria(checklist?.codigoItem);
    const deveVoltarParaPendente = checklist?.statusCliente === "Enviado" && (
      arquivosRestantes === 0 || Boolean(quantidadeObrigatoria && arquivosRestantes < quantidadeObrigatoria)
    );

    if (deveVoltarParaPendente) {
      await prisma.checklistResposta.update({
        where: { id: arquivo.checklistRespostaId },
        data: { statusCliente: "Pendente" }
      });
    }
  }

  await prisma.logSistema.create({
    data: {
      onboardingId: onboarding.id,
      acao: "cliente.arquivo.excluido",
      detalhes: `Arquivo excluido pelo cliente: ${arquivo.nomeOriginal}`
    }
  });

  return NextResponse.json({ ok: true });
}
