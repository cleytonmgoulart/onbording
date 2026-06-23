import StatusBadge from "@/components/StatusBadge";

export default function PainelCliente({ cliente, status, painel }: { cliente: string; status: string; painel: any }) {
  return (
    <>
      <section className="client-name-panel">
        <span>Cliente</span>
        <strong>{cliente || "Cliente nao informado"}</strong>
      </section>

      <section className="client-panel">
        <div>
          <span>Status</span>
          <StatusBadge value={status} />
        </div>
        <div>
          <span>Prazo das pendencias</span>
          <strong>{new Date(painel.prazo).toLocaleDateString("pt-BR")}</strong>
        </div>
        <div>
          <span>Pendencias abertas</span>
          <strong>{painel.pendenciasAbertas}</strong>
        </div>
        <div>
          <span>Conclusao</span>
          <strong>{painel.percentualConclusao}%</strong>
        </div>
        <div>
          <span>Situacao do prazo</span>
          <StatusBadge value={painel.situacaoPrazo} />
        </div>
      </section>
    </>
  );
}
