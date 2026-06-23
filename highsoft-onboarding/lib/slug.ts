export function sanitizeSlug(value: string, fallback = "sem-nome") {
  const clean = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .toLowerCase();

  return clean || fallback;
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}
