import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadCsv, tradesCsvFilename } from './download-csv';

describe('tradesCsvFilename', () => {
  it('uses the UTC date from the given timestamp', () => {
    expect(tradesCsvFilename(new Date('2026-08-30T23:15:00.000Z'))).toBe(
      'trades-export-2026-08-30.csv'
    );
  });
});

describe('downloadCsv', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a csv blob and clicks a temporary download link', () => {
    const createObjectURL = vi.fn(() => 'blob:trades-csv');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    });

    const click = vi.fn();
    const realCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(
      (tagName, options) => {
        const element = realCreateElement(tagName, options);
        if (tagName === 'a') {
          element.click = click;
        }
        return element;
      }
    );

    downloadCsv('trades-export-2026-08-30.csv', 'Trade ID\nTRD-001');

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:trades-csv');
  });
});
