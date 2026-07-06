export function generateConfidenceTooltip(metadata = {}, confidence = 0) {
  const pct = Math.round((confidence || 0) * 100);
  const months = metadata?.monthsHistorical ?? 'N/A';
  const tx = metadata?.transactionsAnalyzed ?? 'N/A';
  const missing = metadata?.missingData ? `${metadata.monthsWithNoData} missing month(s)` : 'No missing months';

  return `Confidence is ${pct}% based on ${months} months of historical data and ${tx} transactions. ${missing}.`;
}
