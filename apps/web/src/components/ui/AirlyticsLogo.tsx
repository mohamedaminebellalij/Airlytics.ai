export function AirlyticsLogo({ size = 32 }: { size?: number }) {
  const id = 'alg-' + size;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5b86ff" />
          <stop offset="100%" stopColor="#2bd9a0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id})`} />
      {/* Trend line */}
      <polyline
        points="5,23 10,17 15,20 21,11 27,7"
        stroke="white" strokeWidth="2.2" fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Rising arrow tip */}
      <polyline
        points="22,7 27,7 27,12"
        stroke="white" strokeWidth="2.2" fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
