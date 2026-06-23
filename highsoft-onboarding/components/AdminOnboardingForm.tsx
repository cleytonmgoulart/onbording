"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { CHECKLIST_OFICIAL, PRIORIDADES } from "@/lib/checklist";

export default function AdminOnboardingForm() {
  const [result, setResult] = useState<{ id: number; linkCliente: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      <form className="form-grid" onSubmit={submit}>
        <label className="span-2 highlight-field">
          Razão social / Nome da empresa
          <input name="razaoSocial" required />
        </label>
        <label>
          CNPJ
          <input name="cnpj" required />
        </label>
        <label>
          Responsável do cliente
          <input name="responsavelNome" required />
        </label>
        <label>
          WhatsApp
          <input name="responsavelWhatsapp" required />
        </label>
        <label>
          E-mail
          <input name="responsavelEmail" type="email" required />
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
          <textarea name="produtoModulosContratados" required />
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
          <h2>Itens solicitados ao cliente</h2>
          <div className="checklist-columns">
            {CHECKLIST_OFICIAL.map((item) => (
              <p key={item.codigoItem}>{item.tituloItem}</p>
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
    </main>
  );
}
