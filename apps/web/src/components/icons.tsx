/** Minimal stroke icon set — no emoji, no clip-art. */
function Base({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

export const MicIcon = () => <Base><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></Base>;
export const ShieldIcon = () => <Base><path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z" /><path d="M9.5 12l2 2 3.5-4" /></Base>;
export const BoltIcon = () => <Base><path d="M13 2L4 14h6l-1 8 9-12h-6z" /></Base>;
export const SwapIcon = () => <Base><path d="M4 7h13l-3-3M20 17H7l3 3" /></Base>;
export const ChatIcon = () => <Base><path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z" /></Base>;
export const CheckIcon = () => <Base><path d="M4 12.5l5 5L20 6.5" /></Base>;
export const GlobeIcon = () => <Base><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" /></Base>;
export const LockIcon = () => <Base><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Base>;
export const DocIcon = () => <Base><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6M9 13h7M9 17h7" /></Base>;
export const ArrowIcon = () => <Base><path d="M4 12h16m-6-6l6 6-6 6" /></Base>;
