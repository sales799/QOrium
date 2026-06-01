function escapePdfText(value: string): string {
  return value
    .replace(/[^\x20-\x7E]/g, '-')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

export function createSimplePdf(title: string, lines: string[]): ArrayBuffer {
  const safeTitle = escapePdfText(title).slice(0, 96);
  const safeLines = lines
    .flatMap((line) => {
      const chunks: string[] = [];
      for (let index = 0; index < line.length; index += 88) {
        chunks.push(line.slice(index, index + 88));
      }
      return chunks.length > 0 ? chunks : [''];
    })
    .slice(0, 28)
    .map(escapePdfText);

  const content = [
    'BT',
    '/F1 18 Tf',
    '50 770 Td',
    `(${safeTitle}) Tj`,
    '/F1 10 Tf',
    '0 -28 Td',
    ...safeLines.map((line) => [`(${line}) Tj`, '0 -16 Td']).flat(),
    'ET',
  ].join('\n');

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += object;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

  const bytes = new TextEncoder().encode(pdf);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
