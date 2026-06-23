"use client";

export default function ClienteDadosEmpresa({ data, disabled, onChange }: any) {
  return (
    <section className="form-grid client-company">
      <label className="span-2 highlight-field company-name">
        Razão social / Nome da empresa
        <input disabled={disabled} value={data.cliente.razaoSocial ?? ""} onChange={(event) => onChange({ cliente: { ...data.cliente, razaoSocial: event.target.value } })} />
      </label>
      <label>
        CNPJ
        <input disabled={disabled} value={data.cliente.cnpj ?? ""} onChange={(event) => onChange({ cliente: { ...data.cliente, cnpj: event.target.value } })} />
      </label>
      <label>
        Data do onboarding
        <input disabled value={data.dataOnboarding ? new Date(data.dataOnboarding).toLocaleDateString("pt-BR") : "Não informada"} />
      </label>
      <label>
        Responsável pelo envio
        <input disabled={disabled} value={data.clienteResponsavelEnvio ?? data.cliente.responsavelNome ?? ""} onChange={(event) => onChange({ clienteResponsavelEnvio: event.target.value })} />
      </label>
      <label>
        WhatsApp do responsável
        <input disabled={disabled} value={data.clienteWhatsappEnvio ?? data.cliente.responsavelWhatsapp ?? ""} onChange={(event) => onChange({ clienteWhatsappEnvio: event.target.value })} />
      </label>
      <label>
        E-mail do responsável
        <input disabled={disabled} value={data.clienteEmailEnvio ?? data.cliente.responsavelEmail ?? ""} onChange={(event) => onChange({ clienteEmailEnvio: event.target.value })} />
      </label>
      <label className="checkbox-line">
        <input disabled={disabled} type="checkbox" checked={Boolean(data.cienciaPrazo)} onChange={(event) => onChange({ cienciaPrazo: event.target.checked })} />
        Confirmo ciência do prazo das pendências.
      </label>
    </section>
  );
}
