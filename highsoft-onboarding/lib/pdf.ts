function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "-");
}

function chunkText(text: string, maxLength = 95) {
  const chunks: string[] = [];
  const words = normalizeText(text).split(/\s+/);
  let line = "";

  for (const word of words) {
    if (!line) {
      line = word;
    } else if (`${line} ${word}`.length <= maxLength) {
      line = `${line} ${word}`;
    } else {
      chunks.push(line);
      line = word;
    }
  }

  if (line) chunks.push(line);
  return chunks.length ? chunks : [""];
}

function buildPage(lines: string[]) {
  const content = ["BT", "/F1 10 Tf", "50 790 Td"];
  lines.forEach((line, index) => {
    if (index > 0) content.push("0 -14 Td");
    content.push(`(${escapePdfText(line)}) Tj`);
  });
  content.push("ET");
  return content.join("\n");
}

function object(id: number, content: string | Buffer) {
  const body = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
  return Buffer.concat([Buffer.from(`${id} 0 obj\n`, "utf8"), body, Buffer.from("\nendobj\n", "utf8")]);
}

export function gerarPdfTexto(titulo: string, texto: string) {
  const allLines = [titulo, "", ...texto.split("\n").flatMap((line) => chunkText(line))];
  const pages: string[][] = [];

  for (let index = 0; index < allLines.length; index += 52) {
    pages.push(allLines.slice(index, index + 52));
  }

  const objects: Buffer[] = [];
  const pageObjectIds = pages.map((_, index) => 4 + index * 2);
  const contentObjectIds = pages.map((_, index) => 5 + index * 2);
  const fontObjectId = 4 + pages.length * 2;

  objects.push(object(1, "<< /Type /Catalog /Pages 2 0 R >>"));
  objects.push(object(2, `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`));

  pages.forEach((pageLines, index) => {
    const stream = Buffer.from(buildPage(pageLines), "utf8");
    objects.push(
      object(
        pageObjectIds[index],
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectIds[index]} 0 R >>`
      )
    );
    objects.push(object(contentObjectIds[index], Buffer.concat([Buffer.from(`<< /Length ${stream.length} >>\nstream\n`, "utf8"), stream, Buffer.from("\nendstream", "utf8")])));
  });

  objects.push(object(fontObjectId, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"));

  const header = Buffer.from("%PDF-1.4\n", "utf8");
  const offsets: number[] = [];
  let cursor = header.length;

  for (const item of objects) {
    offsets.push(cursor);
    cursor += item.length;
  }

  const xrefOffset = cursor;
  const xref = [
    `xref`,
    `0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF"
  ].join("\n");

  return Buffer.concat([header, ...objects, Buffer.from(xref, "utf8")]);
}
