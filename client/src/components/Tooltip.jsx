import React from 'react';

export default function Tooltip({ children, text }) {
  return (
    <div className="relative inline-block" tabIndex={0}>
      {children}
      {text ? (
        <div className="tooltip hidden absolute z-50 w-64 p-2 rounded bg-gray-800 text-white text-xs mt-2 shadow-lg">
          {text}
        </div>
      ) : null}
      <style>{`
        .relative.inline-block:focus .tooltip,
        .relative.inline-block:hover .tooltip {
          display: block;
        }
      `}</style>
    </div>
  );
}
