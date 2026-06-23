"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

type Props = {
  onboardings: any[];
  statusOptions: string[];
};

export default function AdminDashboard({ onboardings, statusOptions }: Props) {
  const [filters, setFilters] = useState({ q: "", status: "", implantador: "", analista: "" });

  const filtered = useMemo(() => {
    return onboardings.filter((item) => {
      const haystack = `${item.cliente.razaoSocial} ${item.cliente.cnpj}`.toLowerCase();
      return (
        (!filters.q || haystack.includes(filters.q.toLowerCase())) &&
        (!filters.status || item.status === filters.status) &&
        (!filters.implantador || item.implantadorResponsavel.toLowerCase().includes(filters.implantador.toLowerCase())) &&
        (!filters.analista || item.analistaDbResponsavel.toLowerCase().includes(filters.analista.toLowerCase()))
      );
    });
  }, [filters, onboardings]);

  const totals = statusOptions
    .map((status) => ({ status, total: onboardings.filter((item) => item.status === status).length }))
    .filter((item) => item.total > 0);

  return (
    <main className="shell">
      <Header />
      <section className="toolbar">
        <div>
          <h1>Onboardings</h1>
          <p>Clientes em implantação, documentos e validações internas.</p>
        </div>
        <Link className="button primary" href="/admin/onboardings/novo">
          Novo onboarding
        </Link>
      </section>

      <section className="status-grid">
        <div className="metric">
          <strong>{onboardings.length}</strong>
          <span>Total</span>
        </div>
        {totals.map((item) => (
          <div className="metric" key={item.status}>
            <strong>{item.total}</strong>
            <span>{item.status}</span>
          </div>
        ))}
      </section>

      <section className="filters">
        <input placeholder="Cliente ou CNPJ" value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} />
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
          <option value="">Todos os status</option>
          {statusOptions.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
        <input placeholder="Implantador" value={filters.implantador} onChange={(event) => setFilters({ ...filters, implantador: event.target.value })} />
        <input placeholder="Analista DB" value={filters.analista} onChange={(event) => setFilters({ ...filters, analista: event.target.value })} />
      </section>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>CNPJ</th>
              <th>Status</th>
              <th>Implantador</th>
              <th>Analista DB</th>
              <th>Atualização</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link href={`/admin/onboardings/${item.id}`}>{item.cliente.razaoSocial || "Cliente não informado"}</Link>
                </td>
                <td>{item.cliente.cnpj}</td>
                <td>
                  <StatusBadge value={item.status} />
                </td>
                <td>{item.implantadorResponsavel}</td>
                <td>{item.analistaDbResponsavel}</td>
                <td>{new Date(item.atualizadoEm).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function Header() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <header className="topbar">
      <Link href="/admin" className="brand">
        <img src="/logo-highsoft.svg" alt="" />
        <span>Highsoft Onboarding</span>
      </Link>
      <button className="button ghost" onClick={logout}>
        Sair
      </button>
    </header>
  );
}
