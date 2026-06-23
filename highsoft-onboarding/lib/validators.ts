export const EXTENSOES_PERMITIDAS = [".pdf", ".xml", ".zip", ".jpg", ".jpeg", ".png", ".webp", ".xls", ".xlsx", ".csv", ".txt", ".doc", ".docx"];
export const EXTENSOES_PROIBIDAS = [".exe", ".bat", ".cmd", ".sh", ".msi", ".js", ".php", ".asp", ".aspx", ".jar", ".vbs", ".ps1"];

export function maxFileSizeBytes() {
  const mb = Number(process.env.MAX_FILE_SIZE_MB ?? 50);
  return Math.max(1, mb) * 1024 * 1024;
}

export function validarArquivo(nome: string, tamanho: number) {
  const lower = nome.toLowerCase();
  const ext = lower.includes(".") ? lower.slice(lower.lastIndexOf(".")) : "";

  if (!EXTENSOES_PERMITIDAS.includes(ext) || EXTENSOES_PROIBIDAS.includes(ext)) {
    return { valido: false, erro: `Extensão ${ext || "desconhecida"} não permitida.` };
  }

  if (tamanho > maxFileSizeBytes()) {
    return { valido: false, erro: `Arquivo maior que ${process.env.MAX_FILE_SIZE_MB ?? 50} MB.` };
  }

  return { valido: true };
}

export function requiredString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}
