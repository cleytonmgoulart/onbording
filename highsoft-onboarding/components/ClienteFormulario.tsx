"use client";

import { useState } from "react";
import ClienteChecklistItem from "@/components/ClienteChecklistItem";
import ClienteDadosEmpresa from "@/components/ClienteDadosEmpresa";
import PainelCliente from "@/components/PainelCliente";

type UsuarioPerfil = {
  nome: string;
  senha?: string;
  setor?: string;
  perfil?: string;
};

type MaquinaInfo = {
  identificacao: string;
  detalhes: string;
};

function parseLista<T>(value: string | null | undefined, fallback: T[]): T[] {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.items)) return parsed.items;
  } catch {
    return fallback;
  }

  return fallback;
}

function serializeLista<T>(items: T[]) {
  return JSON.stringify({ version: 1, items });
}

function upper(value: string) {
  return value.toUpperCase();
}

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
    setMessage(response.ok ? "Dados salvos." : result.error ?? "Nao foi possivel salvar.");
    if (response.ok) await reload();
  }

  async function finalizar() {
    await salvar();
    const response = await fetch(`/api/cliente/${token}/finalizar`, { method: "POST" });
    const result = await response.json();
    setMessage(response.ok ? "Envio finalizado. PDF enviado." : result.error ?? "Nao foi possivel finalizar.");
    if (response.ok) await reload();
  }

  const materiais = data.checklist.filter((item: any) => item.tipo === "material");
  const pendencias = data.checklist.filter((item: any) => item.tipo === "pendencia");
  const usuariosPerfis = parseLista<UsuarioPerfil>(data.usuariosPerfis, []);
  const maquinas = parseLista<MaquinaInfo>(data.informacoesMaquinas, []);
  const usuariosConcluidos = usuariosPerfis.some((usuario) => usuario.nome?.trim() && usuario.senha?.trim() && (usuario.setor?.trim() || usuario.perfil?.trim()));
  const maquinasConcluidas = maquinas.some((maquina) => maquina.identificacao?.trim() && maquina.detalhes?.trim());

  function atualizarUsuarioPerfil(index: number, patch: Partial<UsuarioPerfil>) {
    const next = usuariosPerfis.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item));
    mergeData({ usuariosPerfis: serializeLista(next) });
  }

  function adicionarUsuarioPerfil() {
    mergeData({ usuariosPerfis: serializeLista([...usuariosPerfis, { nome: "", senha: "", setor: "" }]) });
  }

  function removerUsuarioPerfil(index: number) {
    mergeData({ usuariosPerfis: serializeLista(usuariosPerfis.filter((_, currentIndex) => currentIndex !== index)) });
  }

  function atualizarMaquina(index: number, patch: Partial<MaquinaInfo>) {
    const next = maquinas.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item));
    mergeData({ informacoesMaquinas: serializeLista(next) });
  }

  function adicionarMaquina() {
    mergeData({ informacoesMaquinas: serializeLista([...maquinas, { identificacao: "", detalhes: "" }]) });
  }

  function removerMaquina(index: number) {
    mergeData({ informacoesMaquinas: serializeLista(maquinas.filter((_, currentIndex) => currentIndex !== index)) });
  }

  return (
    <main className="client-shell">
      <header className="client-header">
        <div>
          <h1>Onboarding Highsoft</h1>
          <p>Preencha as informacoes e envie os arquivos solicitados.</p>
        </div>
      </header>

      <PainelCliente cliente={data.cliente.razaoSocial} status={data.status} painel={currentPainel} />

      {disabled && <div className="notice success-box">Envio finalizado. A edicao esta bloqueada para preservar os documentos enviados.</div>}

      <ClienteDadosEmpresa data={data} disabled={disabled} onChange={mergeData} />

      <section className="panel">
        <h2>Materiais solicitados</h2>
        {materiais.map((item: any) => (
          <ClienteChecklistItem key={item.id} token={token} item={item} disabled={disabled} statusOptions={statusOptions} onChange={updateChecklist} onUploaded={reload} />
        ))}
      </section>

      <section className="panel">
        <h2>Pendencias tecnicas, fiscais, banco e estrutura</h2>
        {pendencias.map((item: any) => (
          <ClienteChecklistItem key={item.id} token={token} item={item} disabled={disabled} statusOptions={statusOptions} onChange={updateChecklist} onUploaded={reload} />
        ))}
      </section>

      <section className={`panel dynamic-list-panel ${usuariosConcluidos ? "completed-card" : ""}`}>
        <div className="section-title-row">
          <div>
            <h2>Usuarios e perfis de acesso</h2>
            {usuariosConcluidos && <p className="quantity-success">Concluido</p>}
          </div>
          <button className="button secondary" disabled={disabled} onClick={adicionarUsuarioPerfil} type="button">
            Inserir novo
          </button>
        </div>
        <div className="dynamic-list">
          {usuariosPerfis.length === 0 && <p className="muted">Nenhum usuario informado.</p>}
          {usuariosPerfis.map((usuario, index) => (
            <div className="dynamic-row" key={index}>
              <label className="required-label">
                Nome
                <input disabled={disabled} value={usuario.nome ?? ""} onChange={(event) => atualizarUsuarioPerfil(index, { nome: upper(event.target.value) })} />
              </label>
              <label className="required-label">
                Senha
                <input disabled={disabled} value={usuario.senha ?? ""} onChange={(event) => atualizarUsuarioPerfil(index, { senha: upper(event.target.value) })} />
              </label>
              <label className="required-label">
                Setor
                <input disabled={disabled} value={usuario.setor ?? usuario.perfil ?? ""} onChange={(event) => atualizarUsuarioPerfil(index, { setor: upper(event.target.value) })} />
              </label>
              <button className="button ghost" disabled={disabled} onClick={() => removerUsuarioPerfil(index)} type="button">
                Remover
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={`panel dynamic-list-panel ${maquinasConcluidas ? "completed-card" : ""}`}>
        <div className="section-title-row">
          <div>
            <h2>Maquinas</h2>
            {maquinasConcluidas && <p className="quantity-success">Concluido</p>}
          </div>
          <button className="button secondary" disabled={disabled} onClick={adicionarMaquina} type="button">
            Inserir novo
          </button>
        </div>
        <div className="dynamic-list">
          {maquinas.length === 0 && <p className="muted">Nenhuma maquina informada.</p>}
          {maquinas.map((maquina, index) => (
            <div className="dynamic-row machine-row" key={index}>
              <label className="required-label">
                Identificacao da maquina
                <input disabled={disabled} value={maquina.identificacao ?? ""} onChange={(event) => atualizarMaquina(index, { identificacao: upper(event.target.value) })} />
              </label>
              <label className="required-label">
                Partes/configuracao da maquina
                <textarea disabled={disabled} value={maquina.detalhes ?? ""} onChange={(event) => atualizarMaquina(index, { detalhes: upper(event.target.value) })} />
              </label>
              <button className="button ghost" disabled={disabled} onClick={() => removerMaquina(index)} type="button">
                Remover
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="form-grid">
        <label className="span-2">
          Observacoes gerais
          <textarea disabled={disabled} value={data.observacoesCliente ?? ""} onChange={(event) => mergeData({ observacoesCliente: upper(event.target.value) })} />
        </label>
      </section>

      {message && <div className="notice">{message}</div>}

      <div className="sticky-actions">
        <button className="button secondary" disabled={disabled} onClick={salvar}>Salvar preenchimento</button>
        <button className="button primary" disabled={disabled} onClick={finalizar}>
          {disabled ? "Envio finalizado - PDF enviado" : "Finalizar envio dos documentos"}
        </button>
      </div>
    </main>
  );
}
