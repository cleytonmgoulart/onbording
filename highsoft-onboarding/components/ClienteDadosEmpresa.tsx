"use client";

export default function ClienteDadosEmpresa({ data, disabled, onChange }: any) {
  function upper(value: string) {
    return value.toUpperCase();
  }

  return (
    <section className="form-grid client-company">
      <label>
        CNPJ
        <input disabled={disabled} value={data.cliente.cnpj ?? ""} onChange={(event) => onChange({ cliente: { ...data.cliente, cnpj: upper(event.target.value) } })} />
      </label>
      <label>
        Data do onboarding
        <input disabled value={data.dataOnboarding ? new Date(data.dataOnboarding).toLocaleDateString("pt-BR") : "Nao informada"} />
      </label>
      <label>
        Responsavel pelo envio
        <input disabled={disabled} value={data.clienteResponsavelEnvio ?? data.cliente.responsavelNome ?? ""} onChange={(event) => onChange({ clienteResponsavelEnvio: upper(event.target.value) })} />
      </label>
      <label>
        WhatsApp do responsavel
        <input disabled={disabled} value={data.clienteWhatsappEnvio ?? data.cliente.responsavelWhatsapp ?? ""} onChange={(event) => onChange({ clienteWhatsappEnvio: upper(event.target.value) })} />
      </label>
      <label>
        E-mail do responsavel
        <input disabled={disabled} value={data.clienteEmailEnvio ?? data.cliente.responsavelEmail ?? ""} onChange={(event) => onChange({ clienteEmailEnvio: upper(event.target.value) })} />
      </label>
      <label className="checkbox-line required-label">
        <input disabled={disabled} type="checkbox" checked={Boolean(data.cienciaPrazo)} onChange={(event) => onChange({ cienciaPrazo: event.target.checked })} />
        Confirmo ciencia do prazo das pendencias.
      </label>
    </section>
  );
}
