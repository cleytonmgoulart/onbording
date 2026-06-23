"use client";

import { ChangeEvent, useState } from "react";

export default function UploadArquivos({
  token,
  itemId,
  disabled,
  maxFiles,
  currentFiles,
  onUploaded
}: {
  token: string;
  itemId: number;
  disabled: boolean;
  maxFiles?: number | null;
  currentFiles?: number;
  onUploaded: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const reachedLimit = Boolean(maxFiles && (currentFiles ?? 0) >= maxFiles);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;
    if (maxFiles && (currentFiles ?? 0) + files.length > maxFiles) {
      setError(`Este item permite no maximo ${maxFiles} arquivo(s).`);
      event.target.value = "";
      return;
    }
    setLoading(true);
    setError("");
    const form = new FormData();
    form.append("checklistRespostaId", String(itemId));
    Array.from(files).forEach((file) => form.append("files", file));
    const response = await fetch(`/api/cliente/${token}/upload`, { method: "POST", body: form });
    const data = await response.json();
    setLoading(false);
    event.target.value = "";
    if (!response.ok) {
      setError(data.error ?? "Falha no upload.");
      return;
    }
    onUploaded();
  }

  return (
    <div className="upload-controls">
      <label className="file-button">
        Bater foto
        <input disabled={disabled || loading || reachedLimit} type="file" accept="image/*" capture="environment" onChange={upload} />
      </label>
      <label className="file-button">
        Anexar arquivo
        <input disabled={disabled || loading || reachedLimit} type="file" multiple onChange={upload} />
      </label>
      {loading && <span className="muted">Enviando...</span>}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
