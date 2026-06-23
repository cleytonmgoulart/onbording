"use client";

import UploadArquivos from "@/components/UploadArquivos";

export default function ClienteChecklistItem({ token, item, disabled, statusOptions, onChange, onUploaded }: any) {
  return (
    <article className="client-check-item">
      <div className="check-title">
        <h3>{item.tituloItem}</h3>
        <span>{item.obrigatorio ? "Obrigatório" : "Opcional"}</span>
      </div>
      <p className="muted">Prazo: acompanhar painel superior</p>
      <div className="inline-form">
        <label>
          Status do cliente
          <select disabled={disabled} value={item.statusCliente} onChange={(event) => onChange(item.id, { statusCliente: event.target.value })}>
            {statusOptions.map((status: string) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <label className="grow">
          Observação
          <input disabled={disabled} value={item.observacaoCliente ?? ""} onChange={(event) => onChange(item.id, { observacaoCliente: event.target.value })} />
        </label>
      </div>
      <UploadArquivos token={token} itemId={item.id} disabled={disabled} onUploaded={onUploaded} />
      <div className="file-list">
        {item.arquivos.length === 0 && <p className="muted">Nenhum arquivo enviado.</p>}
        {item.arquivos.map((arquivo: any) => (
          <p key={arquivo.id}>
            {arquivo.nomeOriginal} · {new Date(arquivo.criadoEm).toLocaleString("pt-BR")} · Highsoft: {arquivo.statusValidacao}
          </p>
        ))}
      </div>
    </article>
  );
}
