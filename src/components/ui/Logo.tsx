import React from 'react';

/**
 * TogetherNow Logo — Concept A
 * Globe (blue ocean + green landmasses) with two figures holding hands on top.
 * Colours follow the design-system CSS variables so they update with any theme change.
 */
export function Logo({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TogetherNow logo"
      role="img"
    >
      {/* ── Globe base (ocean) ─────────────────────────────── */}
      <circle cx="24" cy="28" r="17" fill="#3b82f6" />

      {/* ── Landmass patches (green continents) ───────────── */}
      {/* Large central continent */}
      <ellipse cx="24" cy="27" rx="8" ry="6" fill="#10b981" />
      {/* Left continent */}
      <ellipse cx="13" cy="29" rx="4" ry="3" fill="#10b981" />
      {/* Right continent */}
      <ellipse cx="35" cy="30" rx="3.5" ry="2.5" fill="#10b981" />
      {/* Top polar cap */}
      <ellipse cx="24" cy="14" rx="5" ry="2.5" fill="#10b981" opacity="0.7" />
      {/* Bottom strip */}
      <ellipse cx="24" cy="42" rx="7" ry="2" fill="#10b981" opacity="0.6" />

      {/* ── Globe latitude lines (subtle) ─────────────────── */}
      <path
        d="M7.5 28 Q24 24 40.5 28"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.6"
        fill="none"
      />
      <path
        d="M9 34 Q24 30 39 34"
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="0.6"
        fill="none"
      />
      {/* Globe meridian (vertical) */}
      <path
        d="M24 11 Q28 22 24 45"
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="0.6"
        fill="none"
      />

      {/* ── Globe outline ─────────────────────────────────── */}
      <circle
        cx="24"
        cy="28"
        r="17"
        stroke="#0ea5e9"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />

      {/* ── Figure LEFT (volunteer/person) ────────────────── */}
      {/* Head */}
      <circle cx="17" cy="10" r="2.4" fill="#1f2937" />
      {/* Body */}
      <rect x="15.5" y="12.5" width="3" height="5" rx="1.5" fill="#1f2937" />
      {/* Left arm (reaching right toward other person) */}
      <line x1="18.5" y1="14" x2="21" y2="13" stroke="#1f2937" strokeWidth="1.4" strokeLinecap="round" />
      {/* Left leg */}
      <line x1="16.2" y1="17.5" x2="15.5" y2="20.5" stroke="#1f2937" strokeWidth="1.3" strokeLinecap="round" />
      {/* Right leg */}
      <line x1="17.8" y1="17.5" x2="18.5" y2="20.5" stroke="#1f2937" strokeWidth="1.3" strokeLinecap="round" />

      {/* ── Figure RIGHT ──────────────────────────────────── */}
      {/* Head */}
      <circle cx="31" cy="10" r="2.4" fill="#1f2937" />
      {/* Body */}
      <rect x="29.5" y="12.5" width="3" height="5" rx="1.5" fill="#1f2937" />
      {/* Right arm (reaching left toward other person) */}
      <line x1="29.5" y1="14" x2="27" y2="13" stroke="#1f2937" strokeWidth="1.4" strokeLinecap="round" />
      {/* Left leg */}
      <line x1="30.2" y1="17.5" x2="29.5" y2="20.5" stroke="#1f2937" strokeWidth="1.3" strokeLinecap="round" />
      {/* Right leg */}
      <line x1="31.8" y1="17.5" x2="32.5" y2="20.5" stroke="#1f2937" strokeWidth="1.3" strokeLinecap="round" />

      {/* ── Joined hands (green dot = handshake) ──────────── */}
      <circle cx="24" cy="13" r="1.6" fill="#10b981" />
    </svg>
  );
}
