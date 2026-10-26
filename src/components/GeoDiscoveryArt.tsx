type GeoMode = 'nature' | 'islands' | 'borders';

/** Original, text-free SVG scenery; no remote images or screenshot artifacts. */
export function GeoDiscoveryArt({ mode }: { mode: GeoMode }) {
  return (
    <svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-y-0 right-0 h-full w-[65%]" aria-hidden="true">
      <defs>
        <linearGradient id="geo-nature" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#54c3c8"/><stop offset="1" stopColor="#154e67"/>
        </linearGradient>
        <linearGradient id="geo-islands" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#26b5c4"/><stop offset="1" stopColor="#0b4a86"/>
        </linearGradient>
        <linearGradient id="geo-borders" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#66649f"/><stop offset="1" stopColor="#1d426c"/>
        </linearGradient>
      </defs>
      {mode === 'nature' && <>
        <rect width="300" height="180" fill="url(#geo-nature)"/>
        <circle cx="249" cy="36" r="22" fill="#ffe6a7" opacity=".9"/>
        <path d="M0 143 125 29l94 114Z" fill="#7bb5b0"/>
        <path d="m125 29 28 39-30-12-23 24Z" fill="#f4f7e9"/>
        <path d="M88 146 214 11l106 135Z" fill="#2b7381"/>
        <path d="m214 11 32 45-31-13-22 24Z" fill="#f7f7eb"/>
        <path d="M0 126q59-30 113 2t187-4v56H0Z" fill="#337c6b"/>
        <path d="M0 150q80-35 154-6t146-10v46H0Z" fill="#1b555c"/>
        <path d="M214 123c-54 14-67 21-49 29 24 11-24 21-51 31" fill="none"
          stroke="#70cdd1" strokeWidth="18" strokeLinecap="round"/>
        <g fill="#164c52">
          <path d="m41 149 17-43 17 43Zm34 5 13-31 13 31Zm179-4 17-44 17 44Zm-21 0 10-25 10 25Z"/>
        </g>
        <path d="M32 90q42-15 68 0M222 89q23 9 50-3" stroke="#d0f3ea" strokeWidth="1.6" opacity=".5" fill="none"/>
      </>}
      {mode === 'islands' && <>
        <rect width="300" height="180" fill="url(#geo-islands)"/>
        <g fill="none" stroke="#c1fff0" strokeWidth="2" opacity=".35">
          <path d="M-10 24q63-29 116-4t115 4q57-23 100 0M-10 61q63-27 116-4t115 4q57-21 100 0M-10 163q63-27 116-4t115 4q57-21 100 0"/>
        </g>
        <path d="M79 102q13-37 52-40 32-26 75-7 38 12 47 42 12 21-24 43-39 19-78 9-29 8-59-10-20-13-13-37Z" fill="#81e0cb" opacity=".7"/>
        <path d="M91 104q20-30 44-34 37-22 69-3 28 11 33 31 4 20-25 34-35 15-64 6-32 5-48-13-15-7-9-21Z" fill="#f1dca0"/>
        <path d="M119 105q21-27 55-26 31-3 41 23-7 28-42 25-31 4-54-22Z" fill="#5ba987"/>
        <path d="M142 109q22-23 46-7t-13 21Z" fill="#2c806d"/>
        <path d="M178 104q-5-25 9-47" fill="none" stroke="#815942" strokeWidth="6" strokeLinecap="round"/>
        <g fill="#2c8060">
          <path d="M187 59q-27-16-44 0 28-2 41 9Zm0-1q-5-25-27-31 12 21 24 39Zm0 0q25-27 44-16-22 5-41 25Zm1 1q31-7 43 13-27-13-42-5Z"/>
        </g>
        <g fill="#e7fff1" opacity=".8"><circle cx="52" cy="55" r="2.5"/><circle cx="275" cy="141" r="2"/><circle cx="266" cy="28" r="2"/></g>
      </>}
      {mode === 'borders' && <>
        <rect width="300" height="180" fill="url(#geo-borders)"/>
        <g stroke="#e5edf8" strokeOpacity=".13" fill="none">
          <path d="M0 35h300M0 78h300M0 121h300M0 164h300M50 0v180M100 0v180M150 0v180M200 0v180M250 0v180"/>
        </g>
        <path d="m14 9 88 15 16 38-28 37-72 16-31-53Z" fill="#438c98" stroke="#a8cdcf" strokeWidth="2"/>
        <path d="m102 24 71-18 40 32-9 55-53 27-61-21 28-37Z" fill="#79a882" stroke="#c4dbbe" strokeWidth="2"/>
        <path d="m213 38 83-14 29 64-22 83-88-25-64-26 53-27Z" fill="#c99778" stroke="#f1d4b0" strokeWidth="2"/>
        <path d="m18 115 72-16 61 21 64 26-23 54H-7Z" fill="#426f9a" stroke="#abc7e0" strokeWidth="2"/>
        <path d="M118 62 90 99l61 21 53-27 9-55" fill="none" stroke="#fff2ca"
          strokeWidth="3" strokeDasharray="6 7" strokeLinecap="round"/>
        <g transform="translate(153 68)">
          <circle r="22" fill="#16304e" opacity=".3"/>
          <path d="M0-17a13 13 0 0 0-13 13C-13 5 0 20 0 20S13 5 13-4A13 13 0 0 0 0-17Z"
            fill="#fce8aa" stroke="#fff4d1" strokeWidth="1.5"/>
          <circle cy="-5" r="4.5" fill="#335c7d"/>
        </g>
      </>}
    </svg>
  );
}
