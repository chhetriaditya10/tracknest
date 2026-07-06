import React, { useEffect } from 'react';
import ConfidenceBadge from './ConfidenceBadge';
import ProgressBar from './ProgressBar';
import Tooltip from './Tooltip';
import { trackEvent } from '../lib/analytics';
import { generateConfidenceTooltip } from '../lib/aiUi';

export default function PredictionSummaryCard({ summary = {}, metadata = {} }) {
  const { prediction, predictionConfidence = 0, trend } = summary || {};
  const lastUpdated = metadata?.lastUpdated;

  useEffect(() => {
    // track view event for analytics; non-blocking
    try {
      trackEvent('ai_prediction_view', { prediction: prediction ?? null, confidence: predictionConfidence });
    } catch (e) {}
  }, [prediction, predictionConfidence]);

  const tooltipText = generateConfidenceTooltip(metadata, predictionConfidence);

  return (
    <div className="bg-surface p-4 rounded-lg border border-gray-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Prediction</h3>
          <div className="text-3xl font-bold mt-2">{prediction !== null ? `₦${prediction}` : 'N/A'}</div>
          <div className="text-sm text-gray-300">Trend: <span className="font-medium">{trend}</span></div>
        </div>

          <div className="flex flex-col items-end gap-2 w-48">
          <div className="flex items-center gap-2">
            <ConfidenceBadge confidence={predictionConfidence} tooltipText={tooltipText} />
            <Tooltip text={tooltipText}>
              <button aria-label="Prediction confidence info" className="p-1 rounded-full bg-gray-800 text-white" title="Confidence info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0" fill="currentColor" />
                  <text x="12" y="16" fontSize="12" textAnchor="middle" fill="#000">i</text>
                </svg>
              </button>
            </Tooltip>
          </div>
          <div className="w-full">
            <ProgressBar percent={predictionConfidence * 100} tooltipText={tooltipText} />
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-400 mt-3">Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : '—'}</div>
    </div>
  );
}
