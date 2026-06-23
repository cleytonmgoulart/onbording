import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request, { params }: { params: { token: string } }) {
  const body = await request.json();
  const onboarding = await prisma.onboarding.findUnique({ where: { tokenCliente: params.token } });
  if (!onboarding) return NextResponse.json({ error: "Link inválido." }, { status: 404 });
  if (onboarding.finalizadoCliente || onboarding.bloqueadoParaCliente) {
    return NextResponse.json({ error: "Envio finalizado. Edição bloqueada." }, { status: 403 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.cliente.update({
      where: { id: onboarding.clienteId },
      data: {
        razaoSocial: String(body.razaoSocial ?? "").trim() || undefined,
        cnpj: String(body.cnpj ?? "").trim() || undefined,
        responsavelNome: String(body.responsavelNome ?? "").trim() || undefined,
        responsavelWhatsapp: String(body.responsavelWhatsapp ?? "").trim() || undefined,
        responsavelEmail: String(body.responsavelEmail ?? "").trim() || undefined
      }
    });

    await tx.onboarding.update({
      where: { id: onboarding.id },
      data: {
        clienteResponsavelEnvio: String(body.clienteResponsavelEnvio ?? "").trim() || null,
        clienteWhatsappEnvio: String(body.clienteWhatsappEnvio ?? "").trim() || null,
        clienteEmailEnvio: String(body.clienteEmailEnvio ?? "").trim() || null,
        cienciaPrazo: Boolean(body.cienciaPrazo),
        usuariosPerfis: String(body.usuariosPerfis ?? "").trim() || null,
        informacoesMaquinas: String(body.informacoesMaquinas ?? "").trim() || null,
        observacoesCliente: String(body.observacoesCliente ?? "").trim() || null,
        checklist: {
          update: (body.checklist ?? []).map((item: { id: number; statusCliente: string; observacaoCliente: string }) => ({
            where: { id: Number(item.id) },
            data: {
              statusCliente: item.statusCliente || "Pendente",
              observacaoCliente: item.observacaoCliente?.trim() || null
            }
          }))
        }
      }
    });
  });

  return NextResponse.json({ ok: true });
}
