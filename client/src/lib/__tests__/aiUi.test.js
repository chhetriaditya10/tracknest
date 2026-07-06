import { describe, it, expect } from 'vitest';
import { generateConfidenceTooltip } from '../aiUi';

describe('aiUi.generateConfidenceTooltip', () => {
  it('generates tooltip with full metadata', () => {
    const metadata = { monthsHistorical: 6, transactionsAnalyzed: 48, missingData: false };
    const text = generateConfidenceTooltip(metadata, 0.85);
    expect(text).toContain('85%');
    expect(text).toContain('6 months');
    expect(text).toContain('48');
    expect(text).toContain('No missing months');
  });

  it('handles missing metadata gracefully', () => {
    const text = generateConfidenceTooltip({}, 0.5);
    expect(text).toContain('50%');
    expect(text).toContain('N/A months');
  });
});
