import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CHECKLIST_OFICIAL } from "@/lib/checklist";
import { ensureOnboardingFolders, relativeOnboardingPath } from "@/lib/files";
import { gerarTokenCliente } from "@/lib/tokens";
import { requiredString } from "@/lib/validators";

function dateOrNull(value: FormDataEntryValue | null) {
  const text = requiredString(value);
  return text ? new Date(`${text}T12:00:00`) : null;
}

export async function GET(request: Request) {
  await requireAdmin();
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const status = url.searchParams.get("status")?.trim();
  const implantador = url.searchParams.get("implantador")?.trim();
  const analista = url.searchParams.get("analista")?.trim();

  const onboardings = await prisma.onboarding.findMany({
    where: {
      status: status || undefined,
      implantadorResponsavel: implantador ? { contains: implantador } : undefined,
      analistaDbResponsavel: analista ? { contains: analista } : undefined,
      cliente: q
        ? {
            OR: [{ razaoSocial: { contains: q } }, { cnpj: { contains: q } }]
          }
        : undefined
    },
    include: { cliente: true, checklist: { include: { arquivos: true } } },
    orderBy: { atualizadoEm: "desc" }
  });

  return NextResponse.json(onboardings);
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  const form = await request.formData();
  const tokenCliente = gerarTokenCliente();

  const result = await prisma.$transaction(async (tx) => {
    const cliente = await tx.cliente.create({
      data: {
        razaoSocial: requiredString(form.get("razaoSocial")),
        cnpj: requiredString(form.get("cnpj")),
        responsavelNome: requiredString(form.get("responsavelNome")),
        responsavelWhatsapp: requiredString(form.get("responsavelWhatsapp")),
        responsavelEmail: requiredString(form.get("responsavelEmail"))
      }
    });

    const onboarding = await tx.onboarding.create({
      data: {
        clienteId: cliente.id,
        tokenCliente,
        vendedorResponsavel: requiredString(form.get("vendedorResponsavel")),
        implantadorResponsavel: requiredString(form.get("implantadorResponsavel")),
        coordenadorResponsavel: requiredString(form.get("coordenadorResponsavel")),
        analistaDbResponsavel: requiredString(form.get("analistaDbResponsavel")),
        produtoModulosContratados: requiredString(form.get("produtoModulosContratados")),
        dataVenda: dateOrNull(form.get("dataVenda")),
        dataEntradaOnboarding: dateOrNull(form.get("dataEntradaOnboarding")),
        dataOnboarding: dateOrNull(form.get("dataOnboarding")),
        prioridade: requiredString(form.get("prioridade")) || "Normal",
        risco: "Sem risco",
        motivoRisco: null,
        proximaAcao: requiredString(form.get("proximaAcao")) || null,
        dataProximaAcao: dateOrNull(form.get("dataProximaAcao")),
        observacoesInternas: requiredString(form.get("observacoesInternas")) || null,
        checklist: {
          create: CHECKLIST_OFICIAL.map((item) => ({
            tipo: item.tipo,
            codigoItem: item.codigoItem,
            tituloItem: item.tituloItem,
            obrigatorio: item.obrigatorio
          }))
        },
        historicoStatus: {
          create: { statusNovo: "Novo onboarding", usuarioId: user.id, observacao: "Onboarding criado." }
        },
        logs: {
          create: { usuarioId: user.id, acao: "onboarding.criado", detalhes: "Criação do onboarding." }
        }
      },
      include: { cliente: true }
    });

    const caminhoPasta = relativeOnboardingPath(onboarding, cliente);
    await tx.onboarding.update({ where: { id: onboarding.id }, data: { caminhoPasta } });
    return { ...onboarding, caminhoPasta };
  });

  await ensureOnboardingFolders(result.caminhoPasta);

  return NextResponse.json({
    id: result.id,
    tokenCliente: result.tokenCliente,
    linkCliente: `${process.env.APP_URL ?? "http://localhost:3000"}/cliente/${result.tokenCliente}`
  });
}
