import { Arquivo, ChecklistResposta, Cliente, Onboarding } from "@prisma/client";

type OnboardingCompleto = Onboarding & {
  cliente: Cliente;
  checklist: (ChecklistResposta & { arquivos: Arquivo[] })[];
  arquivos: Arquivo[];
};

type ZipEntry = {
  name: string;
  data: Buffer;
  method: 0 | 8;
};

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let current = index;
  for (let bit = 0; bit < 8; bit += 1) {
    current = current & 1 ? 0xedb88320 ^ (current >>> 1) : current >>> 1;
  }
  return current >>> 0;
});

function crc32(data: Buffer) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date: dosDate };
}

function u16(value: number) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function u32(value: number) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function createZip(entries: ZipEntry[]) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const stamp = dosDateTime();

  for (const entry of entries) {
    const name = Buffer.from(entry.name);
    const compressed = entry.data;
    const checksum = crc32(entry.data);

    const local = Buffer.concat([
      u32(0x04034b50),
      u16(20),
      u16(0),
      u16(entry.method),
      u16(stamp.time),
      u16(stamp.date),
      u32(checksum),
      u32(compressed.length),
      u32(entry.data.length),
      u16(name.length),
      u16(0),
      name,
      compressed
    ]);

    const central = Buffer.concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0),
      u16(entry.method),
      u16(stamp.time),
      u16(stamp.date),
      u32(checksum),
      u32(compressed.length),
      u32(entry.data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name
    ]);

    localParts.push(local);
    centralParts.push(central);
    offset += local.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralDirectory.length),
    u32(offset),
    u16(0)
  ]);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

function escapeXml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseItems(value?: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed?.items)) return parsed.items;
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return [];
  }
  return [];
}

function paragraph(text: string) {
  return `<text:p text:style-name="P1">${escapeXml(text)}</text:p>`;
}

function heading(text: string) {
  return `<text:h text:style-name="H1" text:outline-level="1">${escapeXml(text)}</text:h>`;
}

function contentXml(onboarding: OnboardingCompleto) {
  const usuarios = parseItems(onboarding.usuariosPerfis);
  const maquinas = parseItems(onboarding.informacoesMaquinas);

  const lines = [
    heading("Resumo completo do onboarding"),
    paragraph(`Cliente: ${onboarding.cliente.razaoSocial || "Nao informado"}`),
    paragraph(`CNPJ: ${onboarding.cliente.cnpj || "Nao informado"}`),
    paragraph(`Responsavel: ${onboarding.clienteResponsavelEnvio || onboarding.cliente.responsavelNome || "Nao informado"}`),
    paragraph(`WhatsApp: ${onboarding.clienteWhatsappEnvio || onboarding.cliente.responsavelWhatsapp || "Nao informado"}`),
    paragraph(`E-mail: ${onboarding.clienteEmailEnvio || onboarding.cliente.responsavelEmail || "Nao informado"}`),
    paragraph(`Status: ${onboarding.status}`),
    paragraph(`Data de finalizacao: ${onboarding.dataFinalizacaoCliente?.toLocaleString("pt-BR") ?? "Nao finalizado"}`),
    paragraph(`Ciencia do prazo: ${onboarding.cienciaPrazo ? "Sim" : "Nao"}`),
    heading("Checklist solicitado")
  ];

  for (const item of onboarding.checklist) {
    lines.push(paragraph(`${item.tituloItem} | Cliente: ${item.statusCliente} | Highsoft: ${item.statusHighsoft}`));
    if (item.observacaoCliente) lines.push(paragraph(`Observacao do cliente: ${item.observacaoCliente}`));
    if (item.arquivos.length) {
      for (const arquivo of item.arquivos) {
        lines.push(paragraph(`Arquivo: ${arquivo.nomeOriginal} | ${arquivo.caminhoRelativo}`));
      }
    } else {
      lines.push(paragraph("Arquivo: nenhum arquivo enviado"));
    }
  }

  lines.push(heading("Usuarios e perfis"));
  if (usuarios.length) {
    usuarios.forEach((usuario: any, index: number) => {
      lines.push(paragraph(`Usuario ${index + 1}: ${usuario.nome || "Nao informado"} | Senha: ${usuario.senha || "Nao informada"} | Setor: ${usuario.setor || usuario.perfil || "Nao informado"}`));
    });
  } else {
    lines.push(paragraph("Nenhum usuario informado."));
  }

  lines.push(heading("Maquinas"));
  if (maquinas.length) {
    maquinas.forEach((maquina: any, index: number) => {
      lines.push(paragraph(`Maquina ${index + 1}: ${maquina.identificacao || "Nao informada"} | ${maquina.detalhes || "Sem detalhes"}`));
    });
  } else {
    lines.push(paragraph("Nenhuma maquina informada."));
  }

  lines.push(heading("Observacoes gerais"));
  lines.push(paragraph(onboarding.observacoesCliente || "Sem observacoes."));

  return `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2">
  <office:body>
    <office:text>
      ${lines.join("\n      ")}
    </office:text>
  </office:body>
</office:document-content>`;
}

const stylesXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" office:version="1.2">
  <office:styles>
    <style:style style:name="P1" style:family="paragraph">
      <style:text-properties fo:font-size="11pt"/>
    </style:style>
    <style:style style:name="H1" style:family="paragraph" style:class="text">
      <style:text-properties fo:font-size="16pt" fo:font-weight="bold"/>
    </style:style>
  </office:styles>
</office:document-styles>`;

const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;

export function gerarDocumentoOdf(onboarding: OnboardingCompleto) {
  return createZip([
    { name: "mimetype", data: Buffer.from("application/vnd.oasis.opendocument.text"), method: 0 },
    { name: "content.xml", data: Buffer.from(contentXml(onboarding), "utf8"), method: 0 },
    { name: "styles.xml", data: Buffer.from(stylesXml, "utf8"), method: 0 },
    { name: "META-INF/manifest.xml", data: Buffer.from(manifestXml, "utf8"), method: 0 }
  ]);
}
