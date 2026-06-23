import StatusBadge from "@/components/StatusBadge";

export default function AdminChecklistValidacao({ status }: { status: string }) {
  return <StatusBadge value={status} />;
}
