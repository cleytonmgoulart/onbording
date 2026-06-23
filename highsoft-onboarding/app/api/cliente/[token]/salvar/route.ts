import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uppercaseJsonText, upperTextOrNull, upperTextOrUndefined } from "@/lib/text";

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
        razaoSocial: upperTextOrUndefined(body.razaoSocial),
        cnpj: upperTextOrUndefined(body.cnpj),
        responsavelNome: upperTextOrUndefined(body.responsavelNome),
        responsavelWhatsapp: upperTextOrUndefined(body.responsavelWhatsapp),
        responsavelEmail: upperTextOrUndefined(body.responsavelEmail)
      }
    });

    await tx.onboarding.update({
      where: { id: onboarding.id },
      data: {
        clienteResponsavelEnvio: upperTextOrNull(body.clienteResponsavelEnvio),
        clienteWhatsappEnvio: upperTextOrNull(body.clienteWhatsappEnvio),
        clienteEmailEnvio: upperTextOrNull(body.clienteEmailEnvio),
        cienciaPrazo: Boolean(body.cienciaPrazo),
        usuariosPerfis: uppercaseJsonText(body.usuariosPerfis),
        informacoesMaquinas: uppercaseJsonText(body.informacoesMaquinas),
        observacoesCliente: upperTextOrNull(body.observacoesCliente),
        checklist: {
          update: (body.checklist ?? []).map((item: { id: number; statusCliente: string; observacaoCliente: string }) => ({
            where: { id: Number(item.id) },
            data: {
              statusCliente: item.statusCliente || "Pendente",
              observacaoCliente: upperTextOrNull(item.observacaoCliente)
            }
          }))
        }
      }
    });
  });

  return NextResponse.json({ ok: true });
}
