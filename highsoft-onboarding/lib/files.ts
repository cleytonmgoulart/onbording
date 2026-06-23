import fs from "fs/promises";
import path from "path";
import { Onboarding, Cliente } from "@prisma/client";
import { pastaDoItem } from "@/lib/checklist";
import { onlyDigits, sanitizeSlug } from "@/lib/slug";

const PASTAS_PADRAO = [
  "01_materiais_validacao",
  "02_fiscal_banco_tecnico",
  "03_usuarios",
  "04_maquinas",
  "05_resumos",
  "06_migracao_db"
];

export function storageBasePath() {
  return path.resolve(process.cwd(), process.env.STORAGE_BASE_PATH ?? "./storage/onboarding-clientes");
}

export function clienteFolderName(cliente: Pick<Cliente, "cnpj" | "razaoSocial">) {
  const cnpj = onlyDigits(cliente.cnpj) || "sem-cnpj";
  return `${cnpj}-${sanitizeSlug(cliente.razaoSocial, "cliente")}`;
}

export function relativeOnboardingPath(onboarding: Pick<Onboarding, "dataOnboarding" | "criadoEm">, cliente: Pick<Cliente, "cnpj" | "razaoSocial">) {
  const baseDate = onboarding.dataOnboarding ?? onboarding.criadoEm ?? new Date();
  return path.join(String(baseDate.getFullYear()), clienteFolderName(cliente));
}

export async function ensureOnboardingFolders(relativePathValue: string) {
  const root = path.join(storageBasePath(), relativePathValue);
  await Promise.all(PASTAS_PADRAO.map((folder) => fs.mkdir(path.join(root, folder), { recursive: true })));
  return root;
}

export function timestampFilePart(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

export function buildSavedFileName(codigoItem: string, originalName: string) {
  const ext = path.extname(originalName).toLowerCase();
  const base = sanitizeSlug(path.basename(originalName, ext), "arquivo");
  return `${timestampFilePart()}_${sanitizeSlug(codigoItem, "item")}_${base}${ext}`;
}

export async function saveUploadBuffer(params: {
  onboardingPath: string;
  codigoItem?: string | null;
  nomeOriginal: string;
  buffer: Buffer;
}) {
  const pastaItem = pastaDoItem(params.codigoItem);
  await ensureOnboardingFolders(params.onboardingPath);
  const folder = path.join(storageBasePath(), params.onboardingPath, pastaItem);
  await fs.mkdir(folder, { recursive: true });
  const nomeSalvo = buildSavedFileName(params.codigoItem ?? "avulso", params.nomeOriginal);
  const absolutePath = path.join(folder, nomeSalvo);
  await fs.writeFile(absolutePath, params.buffer);
  return {
    nomeSalvo,
    caminhoRelativo: path.join(params.onboardingPath, pastaItem, nomeSalvo).replace(/\\/g, "/")
  };
}

export function absoluteFromRelative(relativePathValue: string) {
  const absolute = path.resolve(storageBasePath(), relativePathValue);
  const base = storageBasePath();
  if (!absolute.startsWith(base)) {
    throw new Error("Caminho inválido.");
  }
  return absolute;
}

export async function writeResumoFile(onboardingPath: string, fileName: string, content: string) {
  const folder = path.join(storageBasePath(), onboardingPath, "05_resumos");
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(path.join(folder, fileName), content, "utf8");
}

export async function writeResumoBuffer(onboardingPath: string, fileName: string, content: Buffer) {
  const folder = path.join(storageBasePath(), onboardingPath, "05_resumos");
  await fs.mkdir(folder, { recursive: true });
  await fs.writeFile(path.join(folder, fileName), content);
}

export async function removeOnboardingFolder(relativePathValue?: string | null) {
  if (!relativePathValue) return;
  const absolute = absoluteFromRelative(relativePathValue);
  await fs.rm(absolute, { recursive: true, force: true });
}
