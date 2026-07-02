import React from "react";

const LightDashboardNavbar = ({ onMenuClick }) => {
  return (
    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 border-b border-slate-200/80 bg-[#EEF2F9] shadow-sm shadow-slate-200/40">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-slate-600 transition hover:bg-slate-50 md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span className="text-sm font-semibold">Menu</span>
        </button>

        <div className="flex flex-col">
          <p className="text-sm font-semibold text-slate-900">Welcome back,</p>
          <p className="text-sm text-slate-500">Your finance snapshot for today</p>
        </div>
      </div>

      <div className="hidden items-center gap-3 md:flex md:flex-1 md:justify-center">
        <div className="relative">
          <input
            type="search"
            placeholder="Search transactions"
            className="input-field w-52 pr-10 sm:w-72 md:w-80"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.65" y1="16.65" x2="21" y2="21" />
            </svg>
          </span>
        </div>
        <button className="btn-icon" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 1.5.61 2.86 1.6 3.85L3 19l1.5 1.5 5.3-5.3A6 6 0 0 0 18 8Z" />
          </svg>
        </button>
        <button className="btn-icon" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3 shadow-sm shadow-slate-200/50">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
          <span className="text-lg font-semibold">A</span>
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-slate-900">Alex</p>
          <p className="text-xs text-slate-500">Premium member</p>
        </div>
      </div>
    </div>
  );
};

export default LightDashboardNavbar;
