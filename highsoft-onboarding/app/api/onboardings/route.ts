import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CHECKLIST_OFICIAL } from "@/lib/checklist";
import { ensureOnboardingFolders, relativeOnboardingPath } from "@/lib/files";
import { gerarTokenCliente } from "@/lib/tokens";
import { upperText, upperTextOrNull } from "@/lib/text";
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
  const codigosSelecionados = new Set(form.getAll("checklistItens").map((item) => requiredString(item)));
  const checklistSelecionado = CHECKLIST_OFICIAL.filter((item) => codigosSelecionados.has(item.codigoItem));

  if (checklistSelecionado.length === 0) {
    return NextResponse.json({ error: "Selecione pelo menos um item para enviar ao cliente." }, { status: 400 });
  }

  if (checklistSelecionado.length !== codigosSelecionados.size) {
    return NextResponse.json({ error: "A seleção do checklist contém itens inválidos." }, { status: 400 });
  }

  const razaoSocial = upperText(form.get("razaoSocial"));
  if (!razaoSocial) {
    return NextResponse.json({ error: "Informe o nome da empresa." }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const cliente = await tx.cliente.create({
      data: {
        razaoSocial,
        cnpj: upperText(form.get("cnpj")),
        responsavelNome: upperText(form.get("responsavelNome")),
        responsavelWhatsapp: upperText(form.get("responsavelWhatsapp")),
        responsavelEmail: upperText(form.get("responsavelEmail"))
      }
    });

    const onboarding = await tx.onboarding.create({
      data: {
        clienteId: cliente.id,
        tokenCliente,
        vendedorResponsavel: upperText(form.get("vendedorResponsavel")),
        implantadorResponsavel: upperText(form.get("implantadorResponsavel")),
        coordenadorResponsavel: upperText(form.get("coordenadorResponsavel")),
        analistaDbResponsavel: upperText(form.get("analistaDbResponsavel")),
        produtoModulosContratados: upperText(form.get("produtoModulosContratados")),
        dataVenda: dateOrNull(form.get("dataVenda")),
        dataEntradaOnboarding: dateOrNull(form.get("dataEntradaOnboarding")),
        dataOnboarding: dateOrNull(form.get("dataOnboarding")),
        prioridade: requiredString(form.get("prioridade")) || "Normal",
        risco: "Sem risco",
        motivoRisco: null,
        proximaAcao: upperTextOrNull(form.get("proximaAcao")),
        dataProximaAcao: dateOrNull(form.get("dataProximaAcao")),
        observacoesInternas: upperTextOrNull(form.get("observacoesInternas")),
        checklist: {
          create: checklistSelecionado.map((item) => ({
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
