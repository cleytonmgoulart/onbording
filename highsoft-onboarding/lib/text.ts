export function upperText(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

export function upperTextOrNull(value: unknown) {
  const text = upperText(value);
  return text || null;
}

export function upperTextOrUndefined(value: unknown) {
  const text = upperText(value);
  return text || undefined;
}

export function uppercaseJsonText(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(uppercaseDeep(parsed));
  } catch {
    return text.toUpperCase();
  }
}

function uppercaseDeep(value: unknown): unknown {
  if (typeof value === "string") return value.toUpperCase();
  if (Array.isArray(value)) return value.map(uppercaseDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, current]) => [key, uppercaseDeep(current)]));
  }
  return value;
}
