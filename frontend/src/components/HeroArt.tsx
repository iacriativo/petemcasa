export default function HeroArt() {
  return (
    <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7cc496" />
          <stop offset="100%" stopColor="#4aa86f" />
        </linearGradient>
      </defs>

      <g transform="rotate(-12 40 30)">
        <path d="M40 40c-2-16 6-28 22-30-2 16-10 28-22 30Z" fill="url(#leafGrad)" opacity="0.8" />
        <path d="M47 18c10 3 15 10 13 20" stroke="#2f8a55" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
      <g transform="rotate(10 180 24)">
        <path d="M180 24c2-12-3-19-15-22 2 12 7 19 15 22Z" fill="url(#leafGrad)" opacity="0.7" />
      </g>

      <ellipse cx="78" cy="108" rx="44" ry="16" fill="#eaf5ee" />

      <g>
        <ellipse cx="72" cy="96" rx="26" ry="20" fill="#e2a45f" />
        <ellipse cx="72" cy="92" rx="19" ry="15" fill="#eab474" />
        <path d="M50 84c-6-6-4-14 2-18 2 6 8 9 16 9s14-3 16-9c6 4 8 12 2 18" fill="#dc9850" />
        <ellipse cx="62" cy="76" rx="5" ry="6" fill="#d18c44" />
        <ellipse cx="84" cy="76" rx="5" ry="6" fill="#d18c44" />
        <ellipse cx="72" cy="90" rx="9" ry="6.5" fill="#f7e3c3" />
        <ellipse cx="72" cy="92" rx="5" ry="3.6" fill="#3a2b21" />
        <path d="M68 95c3 2.5 6 2.5 8 0v3c-2 2-6 2-8 0Z" fill="#f0b1a1" />
        <circle cx="61" cy="69" r="1.7" fill="#2c241d" />
        <circle cx="84" cy="69" r="1.7" fill="#2c241d" />
        <path d="M66 70c2-2 6-2 8 0" stroke="#3a2b21" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <circle cx="40" cy="78" r="7" fill="#df9750" />
        <circle cx="105" cy="80" r="6.5" fill="#df9750" />
      </g>

      <g transform="translate(96 44)">
        <path d="M14 52c-8-12-4-30 8-34 12 4 16 22 8 34-3 4-13 4-16 0Z" fill="#c9d9cd" />
        <path d="M16 56c4 8 16 8 20 0" fill="#b5c8ba" />
        <path d="M20 20l-6-8M22 22l-4-9" stroke="#c9d9cd" strokeWidth="4" strokeLinecap="round" />
        <path d="M30 24l8-6M30 27l8-4" stroke="#c9d9cd" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="24" cy="38" rx="10" ry="9" fill="#d8e2da" />
        <path d="M24 30l10-14" stroke="#aebfab" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M24 30l-10-14" stroke="#aebfab" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <ellipse cx="20" cy="36" rx="2.1" ry="2.4" fill="#2c4235" />
        <ellipse cx="28" cy="36" rx="2.1" ry="2.4" fill="#2c4235" />
        <path d="M23 39c.8 1 2.2 1 3 0" stroke="#2c4235" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <path d="M21 42c1 1.4 2 1.6 3 1.4.9.2 1.9 0 3-1.4" stroke="#d49a9e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>

      <g transform="translate(140 64)">
        <path d="M34 22c2 16-4 32-16 26 6-8 10-16 13-28Z" fill="url(#leafGrad)" opacity="0.75" />
        <path d="M40 24c2 12-2 26-16 30" stroke="#2f8a55" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.6" />
      </g>
    </svg>
  )
}