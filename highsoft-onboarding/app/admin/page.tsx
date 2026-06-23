import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { STATUS_ONBOARDING } from "@/lib/checklist";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const onboardings = await prisma.onboarding.findMany({
    include: { cliente: true, checklist: { include: { arquivos: true } } },
    orderBy: { atualizadoEm: "desc" }
  });

  const serialized = JSON.parse(JSON.stringify(onboardings));
  return <AdminDashboard onboardings={serialized} statusOptions={STATUS_ONBOARDING} />;
}
