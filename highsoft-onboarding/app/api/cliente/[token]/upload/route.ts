import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { relativeOnboardingPath, saveUploadBuffer } from "@/lib/files";
import { validarArquivo } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: { token: string } }) {
  const form = await request.formData();
  const checklistRespostaId = Number(form.get("checklistRespostaId"));
  const files = form.getAll("files").filter((value): value is File => value instanceof File);

  const onboarding = await prisma.onboarding.findUnique({
    where: { tokenCliente: params.token },
    include: { cliente: true, checklist: true }
  });

  if (!onboarding) return NextResponse.json({ error: "Link inválido." }, { status: 404 });
  if (onboarding.finalizadoCliente || onboarding.bloqueadoParaCliente) {
    return NextResponse.json({ error: "Envio finalizado. Upload bloqueado." }, { status: 403 });
  }

  const checklist = onboarding.checklist.find((item) => item.id === checklistRespostaId);
  if (!checklist) return NextResponse.json({ error: "Item do checklist inválido." }, { status: 400 });
  if (!files.length) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  const caminhoPasta = onboarding.caminhoPasta ?? relativeOnboardingPath(onboarding, onboarding.cliente);
  const enviados = [];

  for (const file of files) {
    const validacao = validarArquivo(file.name, file.size);
    if (!validacao.valido) return NextResponse.json({ error: validacao.erro }, { status: 400 });

    const saved = await saveUploadBuffer({
      onboardingPath: caminhoPasta,
      codigoItem: checklist.codigoItem,
      nomeOriginal: file.name,
      buffer: Buffer.from(await file.arrayBuffer())
    });

    const arquivo = await prisma.arquivo.create({
      data: {
        onboardingId: onboarding.id,
        checklistRespostaId: checklist.id,
        nomeOriginal: file.name,
        nomeSalvo: saved.nomeSalvo,
        mimeType: file.type || "application/octet-stream",
        tamanhoBytes: file.size,
        caminhoRelativo: saved.caminhoRelativo,
        enviadoPor: "cliente"
      }
    });

    enviados.push(arquivo);
  }

  await prisma.onboarding.update({
    where: { id: onboarding.id },
    data: {
      caminhoPasta,
      status: onboarding.status === "Novo onboarding" ? "Documentação parcial" : onboarding.status,
      checklist: { update: { where: { id: checklist.id }, data: { statusCliente: "Enviado" } } },
      logs: { create: { acao: "cliente.upload", detalhes: `${enviados.length} arquivo(s) enviado(s).` } }
    }
  });

  return NextResponse.json(enviados);
}
