"use client";

import { useState } from "react";
import ClienteChecklistItem from "@/components/ClienteChecklistItem";
import ClienteDadosEmpresa from "@/components/ClienteDadosEmpresa";
import PainelCliente from "@/components/PainelCliente";

export default function ClienteFormulario({ token, onboarding, statusOptions, painel }: any) {
  const [data, setData] = useState(onboarding);
  const [currentPainel, setCurrentPainel] = useState(painel);
  const [message, setMessage] = useState("");
  const disabled = Boolean(data.finalizadoCliente || data.bloqueadoParaCliente);

  function mergeData(patch: any) {
    setData((current: any) => ({ ...current, ...patch }));
  }

  function updateChecklist(id: number, patch: any) {
    setData((current: any) => ({
      ...current,
      checklist: current.checklist.map((item: any) => (item.id === id ? { ...item, ...patch } : item))
    }));
  }

  async function reload() {
    const response = await fetch(`/api/cliente/${token}`);
    if (response.ok) {
      const fresh = await response.json();
      setCurrentPainel(fresh.painel);
      setData(fresh);
    }
  }

  async function salvar() {
    setMessage("");
    const response = await fetch(`/api/cliente/${token}/salvar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razaoSocial: data.cliente.razaoSocial,
        cnpj: data.cliente.cnpj,
        responsavelNome: data.cliente.responsavelNome,
        responsavelWhatsapp: data.cliente.responsavelWhatsapp,
        responsavelEmail: data.cliente.responsavelEmail,
        clienteResponsavelEnvio: data.clienteResponsavelEnvio,
        clienteWhatsappEnvio: data.clienteWhatsappEnvio,
        clienteEmailEnvio: data.clienteEmailEnvio,
        cienciaPrazo: data.cienciaPrazo,
        usuariosPerfis: data.usuariosPerfis,
        informacoesMaquinas: data.informacoesMaquinas,
        observacoesCliente: data.observacoesCliente,
        checklist: data.checklist.map((item: any) => ({
          id: item.id,
          statusCliente: item.statusCliente,
          observacaoCliente: item.observacaoCliente
        }))
      })
    });
    const result = await response.json();
    setMessage(response.ok ? "Dados salvos." : result.error ?? "Não foi possível salvar.");
    if (response.ok) await reload();
  }

  async function finalizar() {
    await salvar();
    const response = await fetch(`/api/cliente/${token}/finalizar`, { method: "POST" });
    const result = await response.json();
    setMessage(response.ok ? "Envio finalizado. Obrigado!" : result.error ?? "Não foi possível finalizar.");
    if (response.ok) await reload();
  }

  const materiais = data.checklist.filter((item: any) => item.tipo === "material");
  const pendencias = data.checklist.filter((item: any) => item.tipo === "pendencia");

  return (
    <main className="client-shell">
      <header className="client-header">
        <img src="/logo-highsoft.svg" alt="Highsoft Sistemas" />
        <div>
          <h1>Onboarding Highsoft</h1>
          <p>Preencha as informações e envie os arquivos solicitados.</p>
        </div>
      </header>

      <PainelCliente cliente={data.cliente.razaoSocial} status={data.status} painel={currentPainel} />

      {disabled && <div className="notice success-box">Envio finalizado. A edição está bloqueada para preservar os documentos enviados.</div>}

      <ClienteDadosEmpresa data={data} disabled={disabled} onChange={mergeData} />

      <section className="panel">
        <h2>Materiais solicitados</h2>
        {materiais.map((item: any) => (
          <ClienteChecklistItem key={item.id} token={token} item={item} disabled={disabled} statusOptions={statusOptions} onChange={updateChecklist} onUploaded={reload} />
        ))}
      </section>

      <section className="panel">
        <h2>Pendências técnicas, fiscais, banco e estrutura</h2>
        {pendencias.map((item: any) => (
          <ClienteChecklistItem key={item.id} token={token} item={item} disabled={disabled} statusOptions={statusOptions} onChange={updateChecklist} onUploaded={reload} />
        ))}
      </section>

      <section className="form-grid">
        <label className="span-2">
          Usuários e perfis de acesso
          <textarea disabled={disabled} value={data.usuariosPerfis ?? ""} onChange={(event) => mergeData({ usuariosPerfis: event.target.value })} />
        </label>
        <label className="span-2">
          Informações das máquinas
          <textarea disabled={disabled} value={data.informacoesMaquinas ?? ""} onChange={(event) => mergeData({ informacoesMaquinas: event.target.value })} />
        </label>
        <label className="span-2">
          Observações gerais
          <textarea disabled={disabled} value={data.observacoesCliente ?? ""} onChange={(event) => mergeData({ observacoesCliente: event.target.value })} />
        </label>
      </section>

      {message && <div className="notice">{message}</div>}

      <div className="sticky-actions">
        <button className="button secondary" disabled={disabled} onClick={salvar}>Salvar preenchimento</button>
        <button className="button primary" disabled={disabled} onClick={finalizar}>Finalizar envio dos documentos</button>
      </div>
    </main>
  );
}
