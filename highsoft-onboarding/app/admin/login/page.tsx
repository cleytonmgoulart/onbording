"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), senha: form.get("senha") })
    });
    setLoading(false);
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Não foi possível entrar.");
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <main className="auth-page">
      <form className="auth-box" onSubmit={submit}>
        <img src="/logo-highsoft.svg" alt="Highsoft Sistemas" className="auth-logo" />
        <h1>Administração</h1>
        <label>
          E-mail
          <input name="email" type="email" defaultValue="admin@highsoft.com.br" required />
        </label>
        <label>
          Senha
          <input name="senha" type="password" defaultValue="admin123" required />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="button primary" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
