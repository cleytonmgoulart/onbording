import { Arquivo, ChecklistResposta, Cliente, Onboarding } from "@prisma/client";
import { quantidadeArquivosObrigatoria } from "@/lib/checklist";

type OnboardingCompleto = Onboarding & {
  cliente: Cliente;
  checklist: (ChecklistResposta & { arquivos: Arquivo[] })[];
  arquivos: Arquivo[];
};

function parseItems(value?: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed?.items)) return parsed.items;
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return [];
  }
  return [];
}

function formatUsuariosPerfis(value?: string | null) {
  const items = parseItems(value);
  if (!items.length) return ["Sem usuarios informados."];
  return items.map(
    (item: any, index: number) =>
      `- Usuario ${index + 1}: ${item.nome || "Nao informado"} | Senha: ${item.senha || "Nao informada"} | Setor: ${item.setor || item.perfil || "Nao informado"}`
  );
}

function formatMaquinas(value?: string | null) {
  const items = parseItems(value);
  if (!items.length) return ["Sem maquinas informadas."];
  return items.map((item: any, index: number) => `- Maquina ${index + 1}: ${item.identificacao || "Nao informada"} | ${item.detalhes || "Sem detalhes"}`);
}

export function addBusinessDays(start: Date, days: number) {
  const date = new Date(start);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return date;
}

export function prazoPendencias(onboarding: Pick<Onboarding, "dataOnboarding" | "criadoEm">) {
  return addBusinessDays(onboarding.dataOnboarding ?? onboarding.criadoEm, 3);
}

export function itemConcluido(item: ChecklistResposta & { arquivos?: Arquivo[] }) {
  const quantidadeObrigatoria = quantidadeArquivosObrigatoria(item.codigoItem);
  const quantidadeArquivos = item.arquivos?.length ?? 0;

  if (quantidadeObrigatoria) {
    return (
      quantidadeArquivos >= quantidadeObrigatoria ||
      item.statusCliente === "NÃ£o se aplica" ||
      item.statusHighsoft === "Validado" ||
      item.statusHighsoft === "NÃ£o se aplica"
    );
  }

  return (
    item.statusCliente === "Concluído" ||
    item.statusCliente === "Enviado" ||
    item.statusCliente === "Não se aplica" ||
    item.statusHighsoft === "Validado" ||
    item.statusHighsoft === "Não se aplica" ||
    Boolean(item.arquivos?.length)
  );
}

export function percentualConclusao(checklist: (ChecklistResposta & { arquivos?: Arquivo[] })[]) {
  const obrigatorios = checklist.filter((item) => item.obrigatorio);
  if (!obrigatorios.length) return 100;
  const concluidos = obrigatorios.filter(itemConcluido).length;
  return Math.round((concluidos / obrigatorios.length) * 100);
}

export function pendenciasAbertas(checklist: (ChecklistResposta & { arquivos?: Arquivo[] })[]) {
  return checklist.filter((item) => item.obrigatorio && !itemConcluido(item)).length;
}

export function situacaoPrazo(onboarding: Onboarding, checklist: (ChecklistResposta & { arquivos?: Arquivo[] })[]) {
  if (pendenciasAbertas(checklist) === 0) return "No prazo";
  const prazo = prazoPendencias(onboarding).getTime();
  const agora = Date.now();
  const diffHoras = (prazo - agora) / 36e5;
  if (agora > prazo) return "Atrasado";
  if (diffHoras <= 24) return "Atenção";
  return "No prazo";
}

export function resumoCliente(onboarding: OnboardingCompleto) {
  return [
    `Cliente: ${onboarding.cliente.razaoSocial || "Cliente não informado"}`,
    `CNPJ: ${onboarding.cliente.cnpj}`,
    `Responsável: ${onboarding.clienteResponsavelEnvio || onboarding.cliente.responsavelNome}`,
    `WhatsApp: ${onboarding.clienteWhatsappEnvio || onboarding.cliente.responsavelWhatsapp}`,
    `E-mail: ${onboarding.clienteEmailEnvio || onboarding.cliente.responsavelEmail}`,
    `Data do onboarding: ${onboarding.dataOnboarding?.toLocaleDateString("pt-BR") ?? "Não informada"}`,
    `Prazo: ${prazoPendencias(onboarding).toLocaleDateString("pt-BR")}`,
    `Ciência do prazo: ${onboarding.cienciaPrazo ? "Sim" : "Não"}`,
    "",
    "Itens enviados:",
    ...onboarding.checklist.map((item) => `- ${item.tituloItem}: ${item.statusCliente} (${item.arquivos.length} arquivo(s))`),
    "",
    "Arquivos enviados:",
    ...onboarding.arquivos.map((arquivo) => `- ${arquivo.nomeOriginal} | ${arquivo.caminhoRelativo}`),
    "",
    "Usuarios e perfis:",
    ...formatUsuariosPerfis(onboarding.usuariosPerfis),
    "",
    "Maquinas:",
    ...formatMaquinas(onboarding.informacoesMaquinas),
    "",
    "Observações do cliente:",
    onboarding.observacoesCliente || "Sem observações."
  ].join("\n");
}

export function resumoInterno(onboarding: OnboardingCompleto) {
  return [
    `Cliente: ${onboarding.cliente.razaoSocial}`,
    `CNPJ: ${onboarding.cliente.cnpj}`,
    `Vendedor: ${onboarding.vendedorResponsavel}`,
    `Implantador: ${onboarding.implantadorResponsavel}`,
    `Coordenador: ${onboarding.coordenadorResponsavel}`,
    `Analista DB: ${onboarding.analistaDbResponsavel}`,
    `Produto/módulos contratados: ${onboarding.produtoModulosContratados}`,
    `Status: ${onboarding.status}`,
    `Prioridade: ${onboarding.prioridade}`,
    `Próxima ação: ${onboarding.proximaAcao || "Não informada"}`,
    `Pendências abertas: ${pendenciasAbertas(onboarding.checklist)}`,
    `Percentual de conclusão: ${percentualConclusao(onboarding.checklist)}%`,
    `Pasta do onboarding: ${onboarding.caminhoPasta || "Não criada"}`,
    "",
    "Observações internas:",
    onboarding.observacoesInternas || "Sem observações."
  ].join("\n");
}

export function manifest(onboarding: OnboardingCompleto) {
  return {
    cliente: onboarding.cliente,
    onboarding: {
      id: onboarding.id,
      status: onboarding.status,
      prioridade: onboarding.prioridade,
      dataFinalizacaoCliente: onboarding.dataFinalizacaoCliente,
      caminhoPasta: onboarding.caminhoPasta
    },
    finalizacao: onboarding.dataFinalizacaoCliente,
    checklist: onboarding.checklist.map((item) => ({
      id: item.id,
      tipo: item.tipo,
      codigoItem: item.codigoItem,
      tituloItem: item.tituloItem,
      obrigatorio: item.obrigatorio,
      statusCliente: item.statusCliente,
      observacaoCliente: item.observacaoCliente,
      statusHighsoft: item.statusHighsoft,
      observacaoHighsoft: item.observacaoHighsoft,
      arquivos: item.arquivos.map((arquivo) => ({
        id: arquivo.id,
        nomeOriginal: arquivo.nomeOriginal,
        caminhoRelativo: arquivo.caminhoRelativo,
        statusValidacao: arquivo.statusValidacao,
        observacaoValidacao: arquivo.observacaoValidacao
      }))
    })),
    arquivos: onboarding.arquivos.map((arquivo) => ({
      id: arquivo.id,
      nomeOriginal: arquivo.nomeOriginal,
      caminhoRelativo: arquivo.caminhoRelativo,
      statusValidacao: arquivo.statusValidacao,
      observacaoValidacao: arquivo.observacaoValidacao
    })),
    responsaveisInternos: {
      vendedor: onboarding.vendedorResponsavel,
      implantador: onboarding.implantadorResponsavel,
      coordenador: onboarding.coordenadorResponsavel,
      analistaDb: onboarding.analistaDbResponsavel
    }
  };
}
