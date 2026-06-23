import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { gerarDocumentoOdf } from "@/lib/odf";
import { gerarPdfTexto } from "@/lib/pdf";
import { manifest, pendenciasAbertas, resumoCliente, resumoInterno } from "@/lib/resumo";
import { relativeOnboardingPath, writeResumoBuffer, writeResumoFile } from "@/lib/files";

const STATUS_FINAL = "Documentos enviados - aguardando DB/migração";

export async function POST(request: Request, { params }: { params: { token: string } }) {
  const onboarding = await prisma.onboarding.findUnique({
    where: { tokenCliente: params.token },
    include: {
      cliente: true,
      checklist: { include: { arquivos: true }, orderBy: { id: "asc" } },
      arquivos: true
    }
  });

  if (!onboarding) return NextResponse.json({ error: "Link inválido." }, { status: 404 });
  if (onboarding.finalizadoCliente || onboarding.bloqueadoParaCliente) {
    return NextResponse.json({ error: "Envio já finalizado." }, { status: 403 });
  }
  if (!onboarding.cienciaPrazo) {
    return NextResponse.json({ error: "É necessário confirmar ciência do prazo." }, { status: 400 });
  }
  const abertas = pendenciasAbertas(onboarding.checklist);
  if (abertas > 0) {
    return NextResponse.json({ error: `Ainda existem ${abertas} pendência(s) obrigatória(s).` }, { status: 400 });
  }

  const caminhoPasta = onboarding.caminhoPasta ?? relativeOnboardingPath(onboarding, onboarding.cliente);
  const dataFinalizacaoCliente = new Date();

  const atualizado = await prisma.onboarding.update({
    where: { id: onboarding.id },
    data: {
      caminhoPasta,
      finalizadoCliente: true,
      dataFinalizacaoCliente,
      bloqueadoParaCliente: true,
      status: STATUS_FINAL,
      historicoStatus: {
        create: {
          statusAnterior: onboarding.status,
          statusNovo: STATUS_FINAL,
          observacao: "Cliente finalizou o envio dos documentos."
        }
      },
      logs: {
        create: {
          acao: "cliente.finalizacao",
          detalhes: "Cliente finalizou o envio dos documentos.",
          userAgent: request.headers.get("user-agent")
        }
      }
    },
    include: {
      cliente: true,
      checklist: { include: { arquivos: true }, orderBy: { id: "asc" } },
      arquivos: true
    }
  });

  const textoResumoCliente = resumoCliente(atualizado);
  await writeResumoFile(caminhoPasta, "resumo_cliente.txt", textoResumoCliente);
  await writeResumoFile(caminhoPasta, "resumo_interno_highsoft.txt", resumoInterno(atualizado));
  await writeResumoFile(caminhoPasta, "manifest.json", JSON.stringify(manifest(atualizado), null, 2));
  await writeResumoBuffer(caminhoPasta, "respostas_cliente.odt", gerarDocumentoOdf(atualizado));
  await writeResumoBuffer(caminhoPasta, "respostas_cliente.pdf", gerarPdfTexto("Respostas do cliente", textoResumoCliente));

  return NextResponse.json({ ok: true, status: STATUS_FINAL, pdfGerado: true });
}
