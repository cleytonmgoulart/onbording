"use client";

import UploadArquivos from "@/components/UploadArquivos";

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

export default function ClienteChecklistItem({ token, item, disabled, statusOptions, onChange, onUploaded }: any) {
  const quantidadeObrigatoria = ITENS_COM_CINCO_ARQUIVOS.has(item.codigoItem) ? 5 : null;
  const quantidadeArquivos = item.arquivos.length;
  const pendentePorQuantidade = Boolean(quantidadeObrigatoria && quantidadeArquivos < quantidadeObrigatoria);
  const concluidoPorQuantidade = Boolean(quantidadeObrigatoria && quantidadeArquivos >= quantidadeObrigatoria);

  async function excluirArquivo(arquivoId: number) {
    const confirmado = window.confirm("Excluir este arquivo enviado?");
    if (!confirmado) return;

    const response = await fetch(`/api/cliente/${token}/arquivos/${arquivoId}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      window.alert(data.error ?? "Nao foi possivel excluir o arquivo.");
      return;
    }

    await onUploaded();
  }

  return (
    <article className={`client-check-item ${concluidoPorQuantidade ? "completed-card" : ""}`}>
      <div className="check-title">
        <h3>{item.tituloItem}</h3>
        <span>{item.obrigatorio ? "Obrigatorio" : "Opcional"}</span>
      </div>
      <p className="muted">Prazo: acompanhar painel superior</p>
      {pendentePorQuantidade && (
        <p className="quantity-warning">
          Pendente: envie {quantidadeObrigatoria} arquivos. Enviados: {quantidadeArquivos}/{quantidadeObrigatoria}.
        </p>
      )}
      {concluidoPorQuantidade && (
        <p className="quantity-success">
          Concluido: {quantidadeArquivos}/{quantidadeObrigatoria} arquivos enviados.
        </p>
      )}
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
          Observacao
          <input disabled={disabled} value={item.observacaoCliente ?? ""} onChange={(event) => onChange(item.id, { observacaoCliente: event.target.value })} />
        </label>
      </div>
      <UploadArquivos
        token={token}
        itemId={item.id}
        disabled={disabled}
        maxFiles={quantidadeObrigatoria}
        currentFiles={quantidadeArquivos}
        onUploaded={onUploaded}
      />
      <div className="file-list">
        {item.arquivos.length === 0 && <p className="muted">Nenhum arquivo enviado.</p>}
        {item.arquivos.map((arquivo: any) => (
          <div className="client-file-row" key={arquivo.id}>
            <p>
              {arquivo.nomeOriginal} - {new Date(arquivo.criadoEm).toLocaleString("pt-BR")} - Highsoft: {arquivo.statusValidacao}
            </p>
            <button className="button ghost" disabled={disabled} onClick={() => excluirArquivo(arquivo.id)} type="button">
              Excluir
            </button>
          </div>
        ))}
      </div>
    </article>
  );
}
