import { ImageResponse } from "next/og";

/**
 * The Rondín logo (white map pin on indigo) as a PNG, drawn with next/og.
 * `maskable` adds safe padding so Android can crop it into a circle or squircle.
 */
export function brandIcon(size: number, { maskable = false, rounded = false } = {}) {
  const pin = Math.round(size * (maskable ? 0.46 : 0.6));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1f1f71 0%, #30329b 60%, #4f51aa 100%)",
          borderRadius: rounded ? size * 0.22 : 0,
        }}
      >
        <svg width={pin} height={pin} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" fill="#ffc600" stroke="#ffc600" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
