"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { CHECKLIST_OFICIAL, PRIORIDADES } from "@/lib/checklist";

const MODULOS_CONTRATADOS = [
  "Vendas",
  "Compras",
  "Estoque",
  "Financeiro",
  "Fiscal",
  "NF-e",
  "NFC-e",
  "NFS-e",
  "PDV",
  "Boletos",
  "Bancos",
  "CRM",
  "Ordem de servico",
  "Producao",
  "Relatorios gerenciais",
  "SPED"
];

const CHECKLIST_POR_MODULO: Record<string, string[]> = {
  Vendas: [
    "clientes-que-mais-compram",
    "ultimas-nf-clientes",
    "produtos-que-mais-vendem",
    "danfe-clientes-que-mais-compram",
    "video-processo-faturamento"
  ],
  Compras: [
    "fornecedores-maiores-titulos",
    "ultimas-nf-fornecedores",
    "produtos-maior-estoque"
  ],
  Estoque: [
    "produtos-que-mais-vendem",
    "produtos-maior-estoque",
    "estrutura-rede"
  ],
  Financeiro: [
    "clientes-maiores-titulos-aberto",
    "fornecedores-maiores-titulos",
    "informacoes-bancarias",
    "contato-gerente-banco"
  ],
  Fiscal: [
    "regime-tributario",
    "certificado-digital",
    "autorizacao-documentos-fiscais",
    "dados-fiscais",
    "ultimas-nf-clientes",
    "ultimas-nf-fornecedores"
  ],
  "NF-e": [
    "certificado-digital",
    "autorizacao-documentos-fiscais",
    "dados-fiscais",
    "ultimas-nf-clientes",
    "danfe-clientes-que-mais-compram"
  ],
  "NFC-e": [
    "certificado-digital",
    "autorizacao-documentos-fiscais",
    "dados-fiscais",
    "estrutura-rede"
  ],
  "NFS-e": [
    "certificado-digital",
    "autorizacao-documentos-fiscais",
    "dados-fiscais"
  ],
  PDV: [
    "video-processo-faturamento",
    "produtos-que-mais-vendem",
    "produtos-maior-estoque",
    "estrutura-rede"
  ],
  Boletos: [
    "informacoes-bancarias",
    "contato-gerente-banco"
  ],
  Bancos: [
    "informacoes-bancarias",
    "contato-gerente-banco"
  ],
  CRM: [
    "clientes-que-mais-compram",
    "clientes-maiores-titulos-aberto"
  ],
  "Ordem de servico": [
    "estrutura-rede",
    "usuariosPerfis"
  ],
  Producao: [
    "produtos-que-mais-vendem",
    "produtos-maior-estoque",
    "estrutura-rede"
  ],
  "Relatorios gerenciais": [
    "clientes-que-mais-compram",
    "clientes-maiores-titulos-aberto",
    "produtos-que-mais-vendem",
    "fornecedores-maiores-titulos"
  ],
  SPED: [
    "regime-tributario",
    "certificado-digital",
    "dados-fiscais",
    "backup-sistema-atual"
  ]
};

function checklistSugeridoPorModulos(modulos: string[]) {
  const codigos = new Set<string>();
  modulos.forEach((modulo) => {
    CHECKLIST_POR_MODULO[modulo]?.forEach((codigo) => codigos.add(codigo));
  });
  return CHECKLIST_OFICIAL.filter((item) => codigos.has(item.codigoItem)).map((item) => item.codigoItem);
}

export default function AdminOnboardingForm() {
  const [result, setResult] = useState<{ id: number; linkCliente: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState(() => CHECKLIST_OFICIAL.map((item) => item.codigoItem));
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [produtoModulos, setProdutoModulos] = useState("");

  function toggleChecklistItem(codigoItem: string) {
    setSelectedItems((current) =>
      current.includes(codigoItem) ? current.filter((item) => item !== codigoItem) : [...current, codigoItem]
    );
  }

  function toggleModulo(modulo: string) {
    const proximos = selectedModules.includes(modulo) ? selectedModules.filter((item) => item !== modulo) : [...selectedModules, modulo];
    const sugestoes = checklistSugeridoPorModulos(proximos);

    setSelectedModules(proximos);
    setProdutoModulos(proximos.join("\n"));
    setSelectedItems(sugestoes.length ? sugestoes : CHECKLIST_OFICIAL.map((item) => item.codigoItem));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/onboardings", { method: "POST", body: new FormData(event.currentTarget) });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Não foi possível criar o onboarding.");
      return;
    }
    setResult(data);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/admin" className="brand">
          <span>Highsoft Onboarding</span>
        </Link>
      </header>
      <section className="toolbar">
        <div>
          <h1>Novo onboarding</h1>
          <p>Crie o cliente, gere o checklist oficial e libere o link público.</p>
        </div>
      </section>
      <form className="form-grid" onSubmit={submit}>
        <label className="span-2 highlight-field">
          Razão social / Nome da empresa
          <input name="razaoSocial" required />
        </label>
        <label>
          CNPJ
          <input name="cnpj" placeholder="O cliente pode preencher pelo link" />
        </label>
        <label>
          Responsável do cliente
          <input name="responsavelNome" placeholder="O cliente pode preencher pelo link" />
        </label>
        <label>
          WhatsApp
          <input name="responsavelWhatsapp" placeholder="O cliente pode preencher pelo link" />
        </label>
        <label>
          E-mail
          <input name="responsavelEmail" placeholder="O cliente pode preencher pelo link" type="email" />
        </label>
        <label>
          Vendedor responsável
          <input name="vendedorResponsavel" required />
        </label>
        <label>
          Implantador responsável
          <input name="implantadorResponsavel" required />
        </label>
        <label>
          Coordenador responsável
          <input name="coordenadorResponsavel" required />
        </label>
        <label>
          Analista DB responsável
          <input name="analistaDbResponsavel" required />
        </label>
        <label className="span-2">
          Produto/módulos contratados
          <div className="module-selector">
            {MODULOS_CONTRATADOS.map((modulo) => (
              <button
                className={`module-chip ${selectedModules.includes(modulo) ? "selected" : ""}`}
                key={modulo}
                onClick={() => toggleModulo(modulo)}
                type="button"
              >
                {modulo}
              </button>
            ))}
          </div>
          <textarea
            name="produtoModulosContratados"
            onChange={(event) => {
              const value = event.target.value;
              const modulosNoTexto = MODULOS_CONTRATADOS.filter((modulo) => value.split("\n").map((item) => item.trim()).includes(modulo));
              const sugestoes = checklistSugeridoPorModulos(modulosNoTexto);

              setProdutoModulos(value);
              setSelectedModules(modulosNoTexto);
              setSelectedItems(sugestoes.length ? sugestoes : CHECKLIST_OFICIAL.map((item) => item.codigoItem));
            }}
            required
            value={produtoModulos}
          />
        </label>
        <label>
          Data da venda
          <input name="dataVenda" type="date" />
        </label>
        <label>
          Data de entrada no onboarding
          <input name="dataEntradaOnboarding" type="date" />
        </label>
        <label>
          Data do onboarding
          <input name="dataOnboarding" type="date" />
        </label>
        <label>
          Prioridade
          <select name="prioridade">
            {PRIORIDADES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Próxima ação
          <input name="proximaAcao" />
        </label>
        <label>
          Data da próxima ação
          <input name="dataProximaAcao" type="date" />
        </label>
        <label className="span-2">
          Observações internas
          <textarea name="observacoesInternas" />
        </label>
        <section className="span-2 checklist-preview">
          <div className="checklist-header">
            <div>
              <h2>Itens solicitados ao cliente</h2>
              <p className="muted">{selectedItems.length} de {CHECKLIST_OFICIAL.length} itens selecionados</p>
            </div>
            <div className="actions">
              <button className="button secondary" type="button" onClick={() => setSelectedItems(CHECKLIST_OFICIAL.map((item) => item.codigoItem))}>
                Marcar todos
              </button>
              <button className="button ghost" type="button" onClick={() => setSelectedItems([])}>
                Desmarcar todos
              </button>
            </div>
          </div>
          <div className="checklist-selector">
            {CHECKLIST_OFICIAL.map((item) => (
              <label className="checklist-option" key={item.codigoItem}>
                <input
                  checked={selectedItems.includes(item.codigoItem)}
                  name="checklistItens"
                  onChange={() => toggleChecklistItem(item.codigoItem)}
                  type="checkbox"
                  value={item.codigoItem}
                />
                <span>
                  <strong>{item.tituloItem}</strong>
                  <small>{item.tipo === "material" ? "Material de validação" : "Pendência"} · {item.obrigatorio ? "Obrigatório" : "Opcional"}</small>
                </span>
              </label>
            ))}
          </div>
        </section>
        {error && <p className="form-error span-2">{error}</p>}
        <div className="actions span-2">
          <button className="button primary" disabled={loading}>
            {loading ? "Criando..." : "Criar onboarding"}
          </button>
          <Link className="button ghost" href="/admin">
            Voltar
          </Link>
        </div>
      </form>
      {result && (
        <div className="notice success-box">
          <strong>Link do cliente gerado</strong>
          <input readOnly value={result.linkCliente} onFocus={(event) => event.currentTarget.select()} />
          <div className="actions">
            <button className="button primary" onClick={() => navigator.clipboard.writeText(result.linkCliente)}>
              Copiar link
            </button>
            <Link className="button secondary" href={`/admin/onboardings/${result.id}`}>
              Abrir detalhe
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
