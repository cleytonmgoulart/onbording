import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminOnboardingForm from "@/components/AdminOnboardingForm";

export default async function NovoOnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return <AdminOnboardingForm />;
}
