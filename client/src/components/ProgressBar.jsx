import React from 'react';
import Tooltip from './Tooltip';
import { trackEvent } from '../lib/analytics';

export default function ProgressBar({ percent = 0, tooltipText = '' }) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  const handleHover = () => trackEvent('ai_confidence_progress_hover', { percent: pct });

  return (
    <Tooltip text={tooltipText}>
      <div className="w-full bg-gray-200 rounded h-3 overflow-hidden" onMouseEnter={handleHover}>
        <div
          className="h-3 rounded bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
          style={{ width: `${pct}%`, transition: 'width 700ms ease' }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </Tooltip>
  );
}
