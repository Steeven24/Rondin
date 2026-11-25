export function ProgressBar({ value, color = "bg-brand", label }: { value: number; color?: string; label: string }) {
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className="block h-2 flex-1 overflow-hidden rounded-full bg-soft"
    >
      <span className={`block h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </span>
  );
}
