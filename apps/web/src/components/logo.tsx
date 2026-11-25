export function Logo({ size = 36, light = true }: { size?: number; light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className="grid place-items-center rounded-[10px] border border-white/20 bg-white/15"
        style={{ width: size, height: size }}
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
      </span>
      <span className={`text-xl font-bold ${light ? "text-white" : "text-ink"}`}>Rondín</span>
    </span>
  );
}
