export default function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone = normalized.includes("cancel") || normalized.includes("bloqueado") || normalized.includes("crítico")
    ? "danger"
    : normalized.includes("atenção") || normalized.includes("parcial") || normalized.includes("aguardando")
      ? "warning"
      : normalized.includes("concluído") || normalized.includes("validado") || normalized.includes("no prazo")
        ? "success"
        : "neutral";

  return <span className={`badge ${tone}`}>{value}</span>;
}
