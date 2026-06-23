import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home">
      <section className="home-panel">
        <h1>Highsoft Onboarding</h1>
        <p>Sistema interno para criar onboardings, gerar links seguros e acompanhar documentos enviados por clientes.</p>
        <Link className="button primary" href="/admin">
          Acessar administração
        </Link>
      </section>
    </main>
  );
}
