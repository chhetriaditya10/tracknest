import React from 'react';
import Tooltip from './Tooltip';
import { trackEvent } from '../lib/analytics';

export default function ConfidenceBadge({ confidence = 0, tooltipText = '' }) {
  const pct = Math.round(confidence * 100);
  let label = 'Low';
  let color = 'bg-red-500';
  if (pct >= 90) {
    label = 'Very High';
    color = 'bg-green-600';
  } else if (pct >= 75) {
    label = 'High';
    color = 'bg-emerald-500';
  } else if (pct >= 50) {
    label = 'Medium';
    color = 'bg-yellow-500';
  }

  const handleHover = () => {
    trackEvent('ai_confidence_hover', { confidence: pct });
  };

  return (
    <Tooltip text={tooltipText}>
      <div onMouseEnter={handleHover} className={`inline-flex items-center px-2 py-1 rounded ${color} text-white text-sm`}>
        <span className="font-semibold mr-2">{label}</span>
        <span className="opacity-90">{pct}%</span>
      </div>
    </Tooltip>
  );
}
