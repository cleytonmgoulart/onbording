import StatusBadge from "@/components/StatusBadge";

export default function PainelCliente({ cliente, status, painel }: { cliente: string; status: string; painel: any }) {
  return (
    <section className="client-panel">
      <div>
        <span>Cliente</span>
        <strong>{cliente || "Cliente não informado"}</strong>
      </div>
      <div>
        <span>Status</span>
        <StatusBadge value={status} />
      </div>
      <div>
        <span>Prazo das pendências</span>
        <strong>{new Date(painel.prazo).toLocaleDateString("pt-BR")}</strong>
      </div>
      <div>
        <span>Pendências abertas</span>
        <strong>{painel.pendenciasAbertas}</strong>
      </div>
      <div>
        <span>Conclusão</span>
        <strong>{painel.percentualConclusao}%</strong>
      </div>
      <div>
        <span>Situação do prazo</span>
        <StatusBadge value={painel.situacaoPrazo} />
      </div>
    </section>
  );
}
