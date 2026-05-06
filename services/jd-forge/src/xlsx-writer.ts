/**
 * Minimal OOXML xlsx writer with no external dependencies.
 *
 * An xlsx file is a ZIP archive of XML parts. We emit the smallest set
 * Excel + Mettl + Google Sheets accept:
 *
 *   [Content_Types].xml
 *   _rels/.rels
 *   xl/workbook.xml
 *   xl/_rels/workbook.xml.rels
 *   xl/worksheets/sheet1.xml
 *
 * String values are inlined per-cell (no shared strings table) which
 * keeps the writer ~150 lines and the output deterministic. For the
 * row counts JD-Forge produces (≤500 questions), inline strings are
 * fine; if/when we ship 100k-row exports, swap for the shared-strings
 * table optimisation.
 *
 * ZIP encoding uses STORED mode (no compression) for simplicity. Excel
 * accepts STORED archives. The trade-off is file size, which is
 * acceptable for the JD-Forge v0 row counts.
 */

import { crc32 } from 'node:zlib';

export type CellValue = string | number | boolean | null;

export interface SheetSpec {
  /** Worksheet tab name (1-31 chars; Excel's restriction). */
  name: string;
  /** Rows-of-cells. Each inner array is one row. */
  rows: CellValue[][];
}

export interface BuildXlsxInputs {
  /** Single sheet for v0; multi-sheet support is a follow-up. */
  sheet: SheetSpec;
}

export function buildXlsx(inputs: BuildXlsxInputs): Buffer {
  const sheetName = sanitiseSheetName(inputs.sheet.name);
  const sheetXml = renderSheetXml(inputs.sheet.rows);
  const files: Array<{ name: string; data: Buffer }> = [
    { name: '[Content_Types].xml', data: Buffer.from(CONTENT_TYPES_XML, 'utf8') },
    { name: '_rels/.rels', data: Buffer.from(ROOT_RELS_XML, 'utf8') },
    { name: 'xl/workbook.xml', data: Buffer.from(workbookXml(sheetName), 'utf8') },
    { name: 'xl/_rels/workbook.xml.rels', data: Buffer.from(WORKBOOK_RELS_XML, 'utf8') },
    { name: 'xl/worksheets/sheet1.xml', data: Buffer.from(sheetXml, 'utf8') },
  ];
  return zip(files);
}

// ---------------------------------------------------------------------------
// XML parts
// ---------------------------------------------------------------------------

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

const WORKBOOK_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;

function workbookXml(sheetName: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="${escapeXmlAttr(sheetName)}" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;
}

function renderSheetXml(rows: CellValue[][]): string {
  const out: string[] = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
    '<sheetData>',
  ];
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] ?? [];
    out.push(`<row r="${r + 1}">`);
    for (let c = 0; c < row.length; c++) {
      const cellRef = `${columnLetter(c)}${r + 1}`;
      const v = row[c];
      if (v === null || v === undefined) continue;
      if (typeof v === 'number' && Number.isFinite(v)) {
        out.push(`<c r="${cellRef}"><v>${v}</v></c>`);
      } else if (typeof v === 'boolean') {
        out.push(`<c r="${cellRef}" t="b"><v>${v ? 1 : 0}</v></c>`);
      } else {
        out.push(
          `<c r="${cellRef}" t="inlineStr"><is><t xml:space="preserve">${escapeXmlText(String(v))}</t></is></c>`,
        );
      }
    }
    out.push('</row>');
  }
  out.push('</sheetData>', '</worksheet>');
  return out.join('');
}

export function columnLetter(zeroBasedIndex: number): string {
  let n = zeroBasedIndex;
  let s = '';
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

function sanitiseSheetName(raw: string): string {
  // Excel sheet name rules: 1-31 chars; can't contain : \ / ? * [ ]
  return raw.replace(/[:\\/?*[\]]/g, '_').slice(0, 31) || 'Sheet1';
}

function escapeXmlAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeXmlText(s: string): string {
  return (
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // eslint-disable-next-line no-control-regex -- XML 1.0 forbids C0 control chars
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
  );
}

// ---------------------------------------------------------------------------
// ZIP encoder (STORED mode, no compression)
// ---------------------------------------------------------------------------

interface ZipEntry {
  name: string;
  data: Buffer;
  crc: number;
  localHeaderOffset: number;
}

function zip(files: Array<{ name: string; data: Buffer }>): Buffer {
  const localParts: Buffer[] = [];
  const entries: ZipEntry[] = [];
  let cursor = 0;
  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const checksum = crc32(file.data);
    const localHeader = buildLocalFileHeader(file.name, file.data.length, checksum, nameBuf.length);
    localParts.push(localHeader, file.data);
    entries.push({ name: file.name, data: file.data, crc: checksum, localHeaderOffset: cursor });
    cursor += localHeader.length + file.data.length;
  }
  const centralDirectory = Buffer.concat(entries.map((e) => buildCentralDirEntry(e)));
  const eocd = buildEndOfCentralDirectory(entries.length, centralDirectory.length, cursor);
  return Buffer.concat([...localParts, centralDirectory, eocd]);
}

function buildLocalFileHeader(
  name: string,
  size: number,
  checksum: number,
  nameLen: number,
): Buffer {
  const buf = Buffer.alloc(30 + nameLen);
  buf.writeUInt32LE(0x04034b50, 0); // local file header signature
  buf.writeUInt16LE(20, 4); // version needed
  buf.writeUInt16LE(0, 6); // general purpose flag
  buf.writeUInt16LE(0, 8); // compression = 0 (stored)
  buf.writeUInt16LE(0, 10); // mod time
  buf.writeUInt16LE(0, 12); // mod date
  buf.writeUInt32LE(checksum >>> 0, 14);
  buf.writeUInt32LE(size, 18); // compressed size
  buf.writeUInt32LE(size, 22); // uncompressed size
  buf.writeUInt16LE(nameLen, 26);
  buf.writeUInt16LE(0, 28); // extra field length
  buf.write(name, 30, 'utf8');
  return buf;
}

function buildCentralDirEntry(entry: ZipEntry): Buffer {
  const nameBuf = Buffer.from(entry.name, 'utf8');
  const buf = Buffer.alloc(46 + nameBuf.length);
  buf.writeUInt32LE(0x02014b50, 0); // central dir signature
  buf.writeUInt16LE(20, 4); // version made by
  buf.writeUInt16LE(20, 6); // version needed
  buf.writeUInt16LE(0, 8); // general purpose flag
  buf.writeUInt16LE(0, 10); // compression
  buf.writeUInt16LE(0, 12); // mod time
  buf.writeUInt16LE(0, 14); // mod date
  buf.writeUInt32LE(entry.crc >>> 0, 16);
  buf.writeUInt32LE(entry.data.length, 20);
  buf.writeUInt32LE(entry.data.length, 24);
  buf.writeUInt16LE(nameBuf.length, 28);
  buf.writeUInt16LE(0, 30); // extra field length
  buf.writeUInt16LE(0, 32); // file comment length
  buf.writeUInt16LE(0, 34); // disk number
  buf.writeUInt16LE(0, 36); // internal file attrs
  buf.writeUInt32LE(0, 38); // external file attrs
  buf.writeUInt32LE(entry.localHeaderOffset, 42);
  nameBuf.copy(buf, 46);
  return buf;
}

function buildEndOfCentralDirectory(count: number, size: number, offset: number): Buffer {
  const buf = Buffer.alloc(22);
  buf.writeUInt32LE(0x06054b50, 0); // EOCD signature
  buf.writeUInt16LE(0, 4); // disk number
  buf.writeUInt16LE(0, 6); // disk with central dir
  buf.writeUInt16LE(count, 8); // entries on this disk
  buf.writeUInt16LE(count, 10); // total entries
  buf.writeUInt32LE(size, 12);
  buf.writeUInt32LE(offset, 16);
  buf.writeUInt16LE(0, 20); // .ZIP comment length
  return buf;
}
