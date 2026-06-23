"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

type Props = {
  onboarding: any;
  statusOptions: string[];
  validacaoOptions: string[];
  appUrl: string;
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

export default function AdminOnboardingDetalhe({ onboarding, statusOptions, validacaoOptions, appUrl }: Props) {
  const [data, setData] = useState(onboarding);
  const [status, setStatus] = useState(onboarding.status);
  const [deleting, setDeleting] = useState(false);
  const linkCliente = `${appUrl}/cliente/${data.tokenCliente}`;

  const arquivos = useMemo(() => data.checklist.flatMap((item: any) => item.arquivos), [data]);
  const usuariosPerfis = useMemo(() => parseItems(data.usuariosPerfis), [data.usuariosPerfis]);
  const maquinas = useMemo(() => parseItems(data.informacoesMaquinas), [data.informacoesMaquinas]);

  async function alterarStatus() {
    const response = await fetch(`/api/onboardings/${data.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (response.ok) window.location.reload();
  }

  async function validarArquivo(fileId: number, statusValidacao: string, observacaoValidacao: string) {
    const response = await fetch(`/api/onboardings/${data.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, statusValidacao, observacaoValidacao })
    });
    if (response.ok) {
      const arquivo = await response.json();
      setData({
        ...data,
        checklist: data.checklist.map((item: any) => ({
          ...item,
          arquivos: item.arquivos.map((current: any) => (current.id === arquivo.id ? arquivo : current))
        }))
      });
    }
  }

  async function excluirOnboarding() {
    const nome = data.cliente.razaoSocial || `onboarding ${data.id}`;
    const confirmado = window.confirm(`Excluir definitivamente ${nome}? Esta acao remove o onboarding, arquivos e pasta do cliente.`);
    if (!confirmado) return;

    setDeleting(true);
    const response = await fetch(`/api/onboardings/${data.id}`, { method: "DELETE" });
    if (!response.ok) {
      const result = await response.json();
      window.alert(result.error ?? "Nao foi possivel excluir o onboarding.");
      setDeleting(false);
      return;
    }

    window.location.href = "/admin";
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
          <h1>{data.cliente.razaoSocial || "Cliente não informado"}</h1>
          <p>{data.cliente.cnpj}</p>
        </div>
        <div className="actions">
          <button className="button secondary" onClick={() => navigator.clipboard.writeText(linkCliente)}>
            Copiar link
          </button>
          <Link className="button primary" href={linkCliente} target="_blank">
            Abrir cliente
          </Link>
          <button className="button danger-button" disabled={deleting} onClick={excluirOnboarding}>
            {deleting ? "Excluindo..." : "Excluir onboarding"}
          </button>
        </div>
      </section>

      <section className="detail-grid">
        <div className="panel">
          <h2>Usuarios e perfis</h2>
          {usuariosPerfis.length === 0 ? (
            <p className="muted">Nenhum usuario informado.</p>
          ) : (
            usuariosPerfis.map((usuario: any, index: number) => (
              <p key={index}>
                <strong>{usuario.nome || "Nome nao informado"}:</strong> Senha: {usuario.senha || "Nao informada"} | Setor: {usuario.setor || usuario.perfil || "Nao informado"}
              </p>
            ))
          )}
        </div>
        <div className="panel">
          <h2>Maquinas</h2>
          {maquinas.length === 0 ? (
            <p className="muted">Nenhuma maquina informada.</p>
          ) : (
            maquinas.map((maquina: any, index: number) => (
              <p key={index}><strong>{maquina.identificacao || "Maquina nao informada"}:</strong> {maquina.detalhes || "Sem detalhes"}</p>
            ))
          )}
        </div>
      </section>

      <section className="detail-grid">
        <div className="panel">
          <h2>Dados do cliente</h2>
          <p><strong>Responsável:</strong> {data.cliente.responsavelNome}</p>
          <p><strong>WhatsApp:</strong> {data.cliente.responsavelWhatsapp}</p>
          <p><strong>E-mail:</strong> {data.cliente.responsavelEmail}</p>
          <p><strong>Link:</strong> <span className="mono">{linkCliente}</span></p>
        </div>
        <div className="panel">
          <h2>Dados Highsoft</h2>
          <p><strong>Status:</strong> <StatusBadge value={data.status} /></p>
          <p><strong>Prioridade:</strong> {data.prioridade}</p>
          <p><strong>Próxima ação:</strong> {data.proximaAcao || "Não informada"}</p>
          <p><strong>Pasta:</strong> {data.caminhoPasta || "Não criada"}</p>
        </div>
      </section>

      <section className="panel">
        <h2>Alterar status</h2>
        <div className="inline-form">
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {statusOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <button className="button primary" onClick={alterarStatus}>Salvar status</button>
        </div>
      </section>

      <section className="panel">
        <h2>Checklist e arquivos</h2>
        <div className="checklist-admin">
          {data.checklist.map((item: any) => (
            <article className="check-item" key={item.id}>
              <div>
                <h3>{item.tituloItem}</h3>
                <p>{item.tipo} · {item.obrigatorio ? "Obrigatório" : "Opcional"} · Cliente: {item.statusCliente}</p>
                {item.observacaoCliente && <p><strong>Obs. cliente:</strong> {item.observacaoCliente}</p>}
              </div>
              {item.arquivos.length === 0 && <p className="muted">Nenhum arquivo enviado.</p>}
              {item.arquivos.map((arquivo: any) => (
                <ArquivoValidacao
                  key={arquivo.id}
                  arquivo={arquivo}
                  options={validacaoOptions}
                  onSave={(statusValidacao, observacaoValidacao) => validarArquivo(arquivo.id, statusValidacao, observacaoValidacao)}
                />
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="detail-grid">
        <div className="panel">
          <h2>Observações internas</h2>
          <p>{data.observacoesInternas || "Sem observações."}</p>
        </div>
        <div className="panel">
          <h2>Histórico de status</h2>
          {data.historicoStatus.map((item: any) => (
            <p key={item.id}>{new Date(item.criadoEm).toLocaleString("pt-BR")} · {item.statusAnterior || "-"} → {item.statusNovo}</p>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Lista de arquivos</h2>
        {arquivos.length === 0 ? (
          <p className="muted">Nenhum arquivo enviado.</p>
        ) : (
          arquivos.map((arquivo: any) => (
            <p key={arquivo.id}>
              <Link href={`/api/arquivos/${arquivo.id}`} target="_blank">{arquivo.nomeOriginal}</Link> · {arquivo.caminhoRelativo}
            </p>
          ))
        )}
      </section>
    </main>
  );
}

function ArquivoValidacao({ arquivo, options, onSave }: { arquivo: any; options: string[]; onSave: (status: string, obs: string) => void }) {
  const [status, setStatus] = useState(arquivo.statusValidacao);
  const [obs, setObs] = useState(arquivo.observacaoValidacao ?? "");

  return (
    <div className="file-row">
      <div>
        <Link href={`/api/arquivos/${arquivo.id}`} target="_blank">{arquivo.nomeOriginal}</Link>
        <span>{new Date(arquivo.criadoEm).toLocaleString("pt-BR")}</span>
      </div>
      <select value={status} onChange={(event) => setStatus(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <input placeholder="Observação" value={obs} onChange={(event) => setObs(event.target.value)} />
      <button className="button secondary" onClick={() => onSave(status, obs)}>Salvar</button>
    </div>
  );
}
