export const STATUS_ONBOARDING = [
  "Novo onboarding",
  "Em triagem interna",
  "Aguardando primeiro contato",
  "Aguardando retorno do cliente",
  "Kickoff agendado",
  "Kickoff realizado",
  "Aguardando documentos",
  "Documentação parcial",
  "Documentação recebida",
  "Em validação",
  "Documentos enviados - aguardando DB/migração",
  "Em migração DB",
  "Migração concluída",
  "Bloqueado",
  "Pronto para implantação",
  "Onboarding concluído",
  "Cancelado"
];

export const PRIORIDADES = ["Normal", "Alta", "Urgente"];
export const STATUS_CLIENTE = ["Pendente", "Em andamento", "Enviado", "Concluído", "Não se aplica"];
export const STATUS_VALIDACAO = ["Recebido", "Validado", "Recusado", "Precisa corrigir", "Não se aplica"];

export type ChecklistModelo = {
  tipo: "material" | "pendencia";
  codigoItem: string;
  tituloItem: string;
  obrigatorio: boolean;
  pasta: string;
};

export const CHECKLIST_OFICIAL: ChecklistModelo[] = [
  {
    tipo: "material",
    codigoItem: "clientes-que-mais-compram",
    tituloItem: "Print dos 5 clientes que mais compram",
    obrigatorio: true,
    pasta: "01_materiais_validacao"
  },
  {
    tipo: "material",
    codigoItem: "clientes-maiores-titulos-aberto",
    tituloItem: "Print dos 5 clientes com maiores títulos em aberto",
    obrigatorio: true,
    pasta: "01_materiais_validacao"
  },
  {
    tipo: "material",
    codigoItem: "ultimas-nf-clientes",
    tituloItem: "Print das 5 últimas notas fiscais emitidas para clientes",
    obrigatorio: true,
    pasta: "01_materiais_validacao"
  },
  {
    tipo: "material",
    codigoItem: "produtos-que-mais-vendem",
    tituloItem: "Print dos 5 produtos que mais vendem",
    obrigatorio: true,
    pasta: "01_materiais_validacao"
  },
  {
    tipo: "material",
    codigoItem: "fornecedores-maiores-titulos",
    tituloItem: "Print dos 5 fornecedores com maiores títulos em aberto",
    obrigatorio: true,
    pasta: "01_materiais_validacao"
  },
  {
    tipo: "material",
    codigoItem: "ultimas-nf-fornecedores",
    tituloItem: "Print das 5 últimas notas fiscais de entrada emitidas por fornecedores",
    obrigatorio: true,
    pasta: "01_materiais_validacao"
  },
  {
    tipo: "material",
    codigoItem: "produtos-maior-estoque",
    tituloItem: "Print dos 5 produtos com maior quantidade em estoque",
    obrigatorio: true,
    pasta: "01_materiais_validacao"
  },
  {
    tipo: "material",
    codigoItem: "danfe-clientes-que-mais-compram",
    tituloItem: "PDF/DANFE das notas fiscais dos 5 clientes que mais compram",
    obrigatorio: true,
    pasta: "01_materiais_validacao"
  },
  {
    tipo: "material",
    codigoItem: "video-processo-faturamento",
    tituloItem: "Vídeo curto do processo de faturamento, desde o orçamento até a venda/finalização",
    obrigatorio: true,
    pasta: "01_materiais_validacao"
  },
  {
    tipo: "pendencia",
    codigoItem: "backup-sistema-atual",
    tituloItem: "Backup completo do sistema atual",
    obrigatorio: true,
    pasta: "02_fiscal_banco_tecnico"
  },
  {
    tipo: "pendencia",
    codigoItem: "regime-tributario",
    tituloItem: "Confirmação do regime tributário",
    obrigatorio: true,
    pasta: "02_fiscal_banco_tecnico"
  },
  {
    tipo: "pendencia",
    codigoItem: "certificado-digital",
    tituloItem: "Certificado digital disponível",
    obrigatorio: true,
    pasta: "02_fiscal_banco_tecnico"
  },
  {
    tipo: "pendencia",
    codigoItem: "autorizacao-documentos-fiscais",
    tituloItem: "Autorização para emissão de NF-e, NFC-e e/ou NFS-e, quando aplicável",
    obrigatorio: true,
    pasta: "02_fiscal_banco_tecnico"
  },
  {
    tipo: "pendencia",
    codigoItem: "dados-fiscais",
    tituloItem: "Dados fiscais necessários: série, numeração, CSC/ID Token, inscrição estadual/municipal, quando aplicável",
    obrigatorio: true,
    pasta: "02_fiscal_banco_tecnico"
  },
  {
    tipo: "pendencia",
    codigoItem: "informacoes-bancarias",
    tituloItem: "Informações bancárias para homologação, quando contratada",
    obrigatorio: true,
    pasta: "02_fiscal_banco_tecnico"
  },
  {
    tipo: "pendencia",
    codigoItem: "contato-gerente-banco",
    tituloItem: "Contato do gerente do banco, quando houver homologação bancária",
    obrigatorio: false,
    pasta: "02_fiscal_banco_tecnico"
  },
  {
    tipo: "pendencia",
    codigoItem: "ip-fixo",
    tituloItem: "Verificação de IP fixo, quando necessário",
    obrigatorio: false,
    pasta: "02_fiscal_banco_tecnico"
  },
  {
    tipo: "pendencia",
    codigoItem: "liberacao-portas",
    tituloItem: "Liberação de portas, quando necessário",
    obrigatorio: false,
    pasta: "02_fiscal_banco_tecnico"
  },
  {
    tipo: "pendencia",
    codigoItem: "estrutura-rede",
    tituloItem: "Validação de internet, equipamentos, impressoras e estrutura de rede",
    obrigatorio: true,
    pasta: "02_fiscal_banco_tecnico"
  }
];

export function pastaDoItem(codigoItem?: string | null) {
  return CHECKLIST_OFICIAL.find((item) => item.codigoItem === codigoItem)?.pasta ?? "02_fiscal_banco_tecnico";
}

const ITENS_COM_CINCO_ARQUIVOS = new Set([
  "clientes-que-mais-compram",
  "clientes-maiores-titulos-aberto",
  "ultimas-nf-clientes",
  "produtos-que-mais-vendem",
  "fornecedores-maiores-titulos",
  "ultimas-nf-fornecedores",
  "produtos-maior-estoque",
  "danfe-clientes-que-mais-compram"
]);

export function quantidadeArquivosObrigatoria(codigoItem?: string | null) {
  return codigoItem && ITENS_COM_CINCO_ARQUIVOS.has(codigoItem) ? 5 : null;
}
