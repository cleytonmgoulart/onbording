import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { STATUS_ONBOARDING, STATUS_VALIDACAO } from "@/lib/checklist";
import AdminOnboardingDetalhe from "@/components/AdminOnboardingDetalhe";

export default async function DetalhePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const onboarding = await prisma.onboarding.findUnique({
    where: { id: Number(params.id) },
    include: {
      cliente: true,
      checklist: { include: { arquivos: true }, orderBy: { id: "asc" } },
      arquivos: { orderBy: { criadoEm: "desc" } },
      historicoStatus: { orderBy: { criadoEm: "desc" }, include: { usuario: true } }
    }
  });

  if (!onboarding) notFound();

  return (
    <AdminOnboardingDetalhe
      onboarding={JSON.parse(JSON.stringify(onboarding))}
      statusOptions={STATUS_ONBOARDING}
      validacaoOptions={STATUS_VALIDACAO}
      appUrl={process.env.APP_URL ?? "http://localhost:3000"}
    />
  );
}
