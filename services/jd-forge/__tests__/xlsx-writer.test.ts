import { describe, expect, it } from 'vitest';
import { buildXlsx, columnLetter } from '../src/xlsx-writer';

describe('columnLetter', () => {
  it('produces A..Z for the first 26 columns', () => {
    expect(columnLetter(0)).toBe('A');
    expect(columnLetter(25)).toBe('Z');
  });
  it('rolls over to AA after Z', () => {
    expect(columnLetter(26)).toBe('AA');
    expect(columnLetter(27)).toBe('AB');
  });
  it('handles a deep column index', () => {
    expect(columnLetter(701)).toBe('ZZ');
    expect(columnLetter(702)).toBe('AAA');
  });
});

describe('buildXlsx', () => {
  it('produces a non-empty buffer with the ZIP local file header signature', () => {
    const buf = buildXlsx({
      sheet: {
        name: 'Sheet1',
        rows: [
          ['a', 'b'],
          [1, 2],
        ],
      },
    });
    expect(buf.length).toBeGreaterThan(200);
    // PK\x03\x04 = local file header
    expect(buf[0]).toBe(0x50);
    expect(buf[1]).toBe(0x4b);
    expect(buf[2]).toBe(0x03);
    expect(buf[3]).toBe(0x04);
  });

  it('emits the End of Central Directory signature near the end', () => {
    const buf = buildXlsx({
      sheet: { name: 'X', rows: [['a']] },
    });
    // Search for PK\x05\x06
    let foundAt = -1;
    for (let i = buf.length - 22; i >= 0; i--) {
      if (buf[i] === 0x50 && buf[i + 1] === 0x4b && buf[i + 2] === 0x05 && buf[i + 3] === 0x06) {
        foundAt = i;
        break;
      }
    }
    expect(foundAt).toBeGreaterThan(0);
  });

  it('lists exactly 5 entries in the central directory', () => {
    const buf = buildXlsx({ sheet: { name: 'X', rows: [['a']] } });
    // EOCD entry count is at offset (eocd + 10) — 16-bit LE total entries
    let eocd = -1;
    for (let i = buf.length - 22; i >= 0; i--) {
      if (buf[i] === 0x50 && buf[i + 1] === 0x4b && buf[i + 2] === 0x05 && buf[i + 3] === 0x06) {
        eocd = i;
        break;
      }
    }
    const totalEntries = buf.readUInt16LE(eocd + 10);
    expect(totalEntries).toBe(5);
  });

  it('emits cell values in the inline-string XML', () => {
    const buf = buildXlsx({
      sheet: { name: 'X', rows: [['hello world'], ['foo bar baz']] },
    });
    const text = buf.toString('utf8');
    // The sheet1.xml part is uncompressed (stored mode), so we can see the strings.
    expect(text).toContain('hello world');
    expect(text).toContain('foo bar baz');
  });

  it('emits numeric values as <v> not inline-string', () => {
    const buf = buildXlsx({
      sheet: { name: 'X', rows: [['header'], [42]] },
    });
    const text = buf.toString('utf8');
    expect(text).toContain('<v>42</v>');
  });

  it('escapes XML special characters in string cells', () => {
    const buf = buildXlsx({
      sheet: { name: 'X', rows: [['<a>&b</a>']] },
    });
    const text = buf.toString('utf8');
    expect(text).toContain('&lt;a&gt;&amp;b&lt;/a&gt;');
    expect(text).not.toContain('<a>&b</a>');
  });

  it('clamps + sanitises sheet names per Excel rules', () => {
    const buf = buildXlsx({
      sheet: { name: 'a/b\\c?d*e[f]g'.padEnd(50, 'x'), rows: [] },
    });
    const text = buf.toString('utf8');
    expect(text).toMatch(/sheet name="a_b_c_d_e_f_g/);
  });

  it('skips null/undefined cells', () => {
    const buf = buildXlsx({
      sheet: { name: 'X', rows: [[null, 'after-null', null]] },
    });
    const text = buf.toString('utf8');
    expect(text).toContain('after-null');
    // Should only have one <c> element on this row.
    const cellMatches = text.match(/<c\s/g) ?? [];
    expect(cellMatches.length).toBe(1);
  });
});
