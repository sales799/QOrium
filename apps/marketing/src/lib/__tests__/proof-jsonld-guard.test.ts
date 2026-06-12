import { describe, expect, it } from 'vitest';

import { isDatasetJsonLd, safeJsonLdString } from '../proof-jsonld-guard';

const validDataset = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'QOrium psychometric calibration coverage',
  url: 'https://qorium.online/proof',
  variableMeasured: [{ '@type': 'PropertyValue', name: 'questions_released', value: 1417 }],
};

describe('isDatasetJsonLd', () => {
  it('accepts a well-formed schema.org Dataset', () => {
    expect(isDatasetJsonLd(validDataset)).toBe(true);
  });

  it('rejects null and undefined', () => {
    expect(isDatasetJsonLd(null)).toBe(false);
    expect(isDatasetJsonLd(undefined)).toBe(false);
  });

  it('rejects arrays', () => {
    expect(isDatasetJsonLd([validDataset])).toBe(false);
  });

  it('rejects primitives', () => {
    expect(isDatasetJsonLd('Dataset')).toBe(false);
    expect(isDatasetJsonLd(42)).toBe(false);
    expect(isDatasetJsonLd(true)).toBe(false);
  });

  it('rejects the wrong @type', () => {
    expect(isDatasetJsonLd({ ...validDataset, '@type': 'WebPage' })).toBe(false);
  });

  it('rejects a missing or empty @context', () => {
    expect(isDatasetJsonLd({ ...validDataset, '@context': '' })).toBe(false);
    const { ['@context']: _omitted, ...noContext } = validDataset;
    expect(isDatasetJsonLd(noContext)).toBe(false);
  });

  it('rejects a missing or empty name', () => {
    expect(isDatasetJsonLd({ ...validDataset, name: '   ' })).toBe(false);
    const { name: _omitted, ...noName } = validDataset;
    expect(isDatasetJsonLd(noName)).toBe(false);
  });

  it('rejects an API error envelope', () => {
    expect(isDatasetJsonLd({ ok: false, status: 404, title: 'Not Found' })).toBe(false);
  });
});

describe('safeJsonLdString', () => {
  it('serialises a valid Dataset to JSON', () => {
    const out = safeJsonLdString(validDataset);
    expect(out).not.toBeNull();
    expect(JSON.parse(out as string)).toEqual(validDataset);
  });

  it('returns null for an invalid payload', () => {
    expect(safeJsonLdString(null)).toBeNull();
    expect(safeJsonLdString({ '@type': 'WebPage' })).toBeNull();
  });

  it('neutralises a closing-script break-out in a string field', () => {
    const out = safeJsonLdString({
      ...validDataset,
      description: 'pwn </script><script>alert(1)</script>',
    });
    expect(out).not.toBeNull();
    expect(out as string).not.toContain('</script>');
    // The data is still recoverable as JSON once the escape is reversed.
    const recovered = JSON.parse((out as string).replace(/<\\\/(script)/gi, '</$1')) as {
      description: string;
    };
    expect(recovered.description).toContain('alert(1)');
  });
});
