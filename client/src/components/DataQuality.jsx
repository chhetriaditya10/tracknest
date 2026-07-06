import React from 'react';

export default function DataQuality({ metadata = {} }) {
  const { transactionsAnalyzed, monthsHistorical, categoriesIncluded = [], missingData, monthsWithNoData } = metadata || {};

  return (
    <div className="bg-surface p-3 rounded border border-gray-700">
      <h4 className="font-semibold mb-2">Data Quality</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Transactions analyzed:</div>
        <div className="text-right">{transactionsAnalyzed ?? 'N/A'}</div>
        <div>Months historical:</div>
        <div className="text-right">{monthsHistorical ?? 'N/A'}</div>
        <div>Categories included:</div>
        <div className="text-right">{categoriesIncluded.length ? categoriesIncluded.join(', ') : 'N/A'}</div>
        <div>Missing months:</div>
        <div className="text-right">{missingData ? `${monthsWithNoData} month(s)` : 'None'}</div>
      </div>
    </div>
  );
}
