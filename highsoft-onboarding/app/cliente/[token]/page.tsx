import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ClienteFormulario from "@/components/ClienteFormulario";
import { STATUS_CLIENTE } from "@/lib/checklist";
import { pendenciasAbertas, percentualConclusao, prazoPendencias, situacaoPrazo } from "@/lib/resumo";

export default async function ClientePage({ params }: { params: { token: string } }) {
  const onboarding = await prisma.onboarding.findUnique({
    where: { tokenCliente: params.token },
    include: {
      cliente: true,
      checklist: { include: { arquivos: true }, orderBy: { id: "asc" } },
      arquivos: true
    }
  });

  if (!onboarding) notFound();

  return (
    <ClienteFormulario
      token={params.token}
      onboarding={JSON.parse(JSON.stringify(onboarding))}
      statusOptions={STATUS_CLIENTE}
      painel={{
        prazo: prazoPendencias(onboarding).toISOString(),
        pendenciasAbertas: pendenciasAbertas(onboarding.checklist),
        percentualConclusao: percentualConclusao(onboarding.checklist),
        situacaoPrazo: situacaoPrazo(onboarding, onboarding.checklist)
      }}
    />
  );
}
