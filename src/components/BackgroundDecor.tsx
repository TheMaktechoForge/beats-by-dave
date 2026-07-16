import { getSignedUrl } from "@/lib/supabase";

const BEAT_COVERS: { path: string; x: string; y: string; size: number; dur: number; delay: number; spinDir: 1 | -1 }[] = [
  { path: "covers/having-thangs.png",            x: "8%",  y: "12%", size: 220, dur: 38, delay: 0,  spinDir: 1 },
  { path: "covers/southern-dog-1-trap-life.png", x: "82%", y: "18%", size: 260, dur: 46, delay: -7, spinDir: -1 },
  { path: "covers/southern-dog-2-trap-or-die.png",x: "12%", y: "58%", size: 200, dur: 42, delay: -3, spinDir: 1 },
  { path: "covers/southern-dog-4-trap-god.png",  x: "76%", y: "62%", size: 240, dur: 50, delay: -11, spinDir: -1 },
  { path: "covers/don-t-trust-scars.png",        x: "44%", y: "8%",  size: 180, dur: 36, delay: -5, spinDir: 1 },
  { path: "covers/wheels-on-dope.png",           x: "52%", y: "78%", size: 200, dur: 44, delay: -9, spinDir: -1 },
  { path: "covers/mouth-like-flood-lights.png",  x: "20%", y: "82%", size: 180, dur: 40, delay: -2, spinDir: 1 },
  { path: "covers/tucked-n-sealed.png",          x: "70%", y: "40%", size: 220, dur: 48, delay: -13, spinDir: -1 },
];

export async function BackgroundDecor() {
  // Sign each cover URL individually with a try/catch so one missing
  // object can't take the whole page down (and so the prerender step
  // doesn't fail the build).
  const covers = await Promise.all(
    BEAT_COVERS.map(async (c) => {
      try {
        const url = await getSignedUrl(c.path, 60 * 60 * 24 * 7); // 7 days
        return { ...c, url };
      } catch {
        return { ...c, url: null };
      }
    })
  );

  return (
    <div className="bg-decor" aria-hidden="true">
      {/* slow drifting color wash (lime / violet / magenta) */}
      <div className="bg-decor__wash bg-decor__wash--a" />
      <div className="bg-decor__wash bg-decor__wash--b" />
      <div className="bg-decor__wash bg-decor__wash--c" />

      {/* central soft glow that breathes */}
      <div className="bg-decor__core" />

      {/* laughing money-eyes skulls in the upper area */}
      <div className="bg-decor__skull bg-decor__skull--left" aria-hidden="true">
        <div className="bg-decor__skull-breathe">
          <div className="bg-decor__skull-spin">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="cranium-grad-left" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="40%" stopColor="#9B30FF" stopOpacity="0.75" />
                  <stop offset="90%" stopColor="#06080d" stopOpacity="0.95" />
                </radialGradient>
                <filter id="eye-glow-left">
                  <feGaussianBlur stdDeviation="1.5" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path d="M 60 15 C 32 15, 20 35, 20 58 C 20 70, 26 78, 32 82 L 34 98 C 34 102, 38 106, 44 106 L 76 106 C 82 106, 86 102, 86 98 L 88 82 C 94 78, 100 70, 100 58 C 100 35, 88 15, 60 15 Z" fill="url(#cranium-grad-left)" stroke="#9B30FF" strokeWidth="2" />
              <path d="M 23 68 C 28 72, 35 72, 38 68" stroke="#FF3CB4" strokeWidth="1.5" fill="none" />
              <path d="M 97 68 C 92 72, 85 72, 82 68" stroke="#FF3CB4" strokeWidth="1.5" fill="none" />
              <path d="M 38 82 C 38 82, 60 96, 82 82 C 80 94, 40 94, 38 82 Z" fill="#06080d" stroke="#FF3CB4" strokeWidth="1.5" />
              <rect x="44" y="81" width="6" height="4" fill="white" rx="1" />
              <rect x="52" y="81" width="6" height="4" fill="white" rx="1" />
              <rect x="62" y="81" width="6" height="4" fill="white" rx="1" />
              <rect x="70" y="81" width="6" height="4" fill="white" rx="1" />
              <rect x="48" y="87" width="5" height="3" fill="white" rx="1" />
              <rect x="57" y="87" width="6" height="3" fill="white" rx="1" />
              <rect x="67" y="87" width="5" height="3" fill="white" rx="1" />
              <path d="M 60 68 L 56 60 C 54 57, 58 55, 60 57 C 62 55, 66 57, 64 60 Z" fill="#06080d" stroke="#9B30FF" strokeWidth="1" />
              <ellipse cx="42" cy="48" rx="12" ry="14" fill="#06080d" stroke="#9B30FF" strokeWidth="1" />
              <ellipse cx="78" cy="48" rx="12" ry="14" fill="#06080d" stroke="#9B30FF" strokeWidth="1" />
              <text x="42" y="55" fontFamily="monospace, sans-serif" fontWeight="900" fontSize="20" fill="#B5D300" textAnchor="middle" filter="url(#eye-glow-left)" className="bg-decor__skull-eye">$</text>
              <text x="78" y="55" fontFamily="monospace, sans-serif" fontWeight="900" fontSize="20" fill="#B5D300" textAnchor="middle" filter="url(#eye-glow-left)" className="bg-decor__skull-eye">$</text>
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-decor__skull bg-decor__skull--right" aria-hidden="true">
        <div className="bg-decor__skull-breathe">
          <div className="bg-decor__skull-spin">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="cranium-grad-right" cx="40%" cy="35%" r="60%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                  <stop offset="40%" stopColor="#9B30FF" stopOpacity="0.75" />
                  <stop offset="90%" stopColor="#06080d" stopOpacity="0.95" />
                </radialGradient>
                <filter id="eye-glow-right">
                  <feGaussianBlur stdDeviation="1.5" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path d="M 60 15 C 32 15, 20 35, 20 58 C 20 70, 26 78, 32 82 L 34 98 C 34 102, 38 106, 44 106 L 76 106 C 82 106, 86 102, 86 98 L 88 82 C 94 78, 100 70, 100 58 C 100 35, 88 15, 60 15 Z" fill="url(#cranium-grad-right)" stroke="#9B30FF" strokeWidth="2" />
              <path d="M 23 68 C 28 72, 35 72, 38 68" stroke="#FF3CB4" strokeWidth="1.5" fill="none" />
              <path d="M 97 68 C 92 72, 85 72, 82 68" stroke="#FF3CB4" strokeWidth="1.5" fill="none" />
              <path d="M 38 82 C 38 82, 60 96, 82 82 C 80 94, 40 94, 38 82 Z" fill="#06080d" stroke="#FF3CB4" strokeWidth="1.5" />
              <rect x="44" y="81" width="6" height="4" fill="white" rx="1" />
              <rect x="52" y="81" width="6" height="4" fill="white" rx="1" />
              <rect x="62" y="81" width="6" height="4" fill="white" rx="1" />
              <rect x="70" y="81" width="6" height="4" fill="white" rx="1" />
              <rect x="48" y="87" width="5" height="3" fill="white" rx="1" />
              <rect x="57" y="87" width="6" height="3" fill="white" rx="1" />
              <rect x="67" y="87" width="5" height="3" fill="white" rx="1" />
              <path d="M 60 68 L 56 60 C 54 57, 58 55, 60 57 C 62 55, 66 57, 64 60 Z" fill="#06080d" stroke="#9B30FF" strokeWidth="1" />
              <ellipse cx="42" cy="48" rx="12" ry="14" fill="#06080d" stroke="#9B30FF" strokeWidth="1" />
              <ellipse cx="78" cy="48" rx="12" ry="14" fill="#06080d" stroke="#9B30FF" strokeWidth="1" />
              <text x="42" y="55" fontFamily="monospace, sans-serif" fontWeight="900" fontSize="20" fill="#B5D300" textAnchor="middle" filter="url(#eye-glow-right)" className="bg-decor__skull-eye">$</text>
              <text x="78" y="55" fontFamily="monospace, sans-serif" fontWeight="900" fontSize="20" fill="#B5D300" textAnchor="middle" filter="url(#eye-glow-right)" className="bg-decor__skull-eye">$</text>
            </svg>
          </div>
        </div>
      </div>

      {/* low-rider bouncing car drifting above the sound waves */}
      <div className="bg-decor__lowrider" aria-hidden="true">
        <div className="bg-decor__lowrider-drift">
          <div className="bg-decor__lowrider-bounce">
            <svg width="240" height="100" viewBox="0 0 240 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9B30FF" stopOpacity="0.85" />
                  <stop offset="50%" stopColor="#FF3CB4" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#06080d" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="chrome-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#9B30FF" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#06080d" />
                  <stop offset="70%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#FF3CB4" stopOpacity="0.5" />
                </linearGradient>
                <radialGradient id="underglow" cx="50%" cy="100%" r="50%">
                  <stop offset="0%" stopColor="#B5D300" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#B5D300" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Lime Underglow */}
              <ellipse cx="120" cy="85" rx="90" ry="12" fill="url(#underglow)" />

              {/* Car body */}
              {/* Cab/Greenhouse */}
              <path d="M 75 42 L 105 20 L 155 20 L 175 42 Z" fill="#06080d" stroke="#9B30FF" strokeWidth="2" />
              <path d="M 108 23 L 152 23 L 165 42 L 78 42 Z" fill="none" stroke="#FF3CB4" strokeWidth="1" strokeDasharray="2 2" />

              {/* Chassis main body */}
              <path d="M 25 42 C 15 42 10 46 10 52 L 10 68 L 35 68 C 35 62 42 56 52 56 C 62 56 69 62 69 68 L 165 68 C 165 62 172 56 182 56 C 192 56 199 62 199 68 L 225 68 C 230 68 232 64 232 58 L 232 46 C 232 42 225 42 215 42 Z" fill="url(#body-grad)" stroke="#FF3CB4" strokeWidth="1.5" />

              {/* Magenta pinstripe */}
              <path d="M 10 50 L 232 50" stroke="#FF3CB4" strokeWidth="1" />

              {/* Chrome bumpers */}
              <rect x="5" y="60" width="8" height="10" rx="2" fill="url(#chrome-grad)" />
              <rect x="227" y="58" width="8" height="12" rx="2" fill="url(#chrome-grad)" />

              {/* Chrome Side Trim */}
              <line x1="30" y1="62" x2="210" y2="62" stroke="white" strokeWidth="1.5" strokeLinecap="round" />

              {/* Wheels */}
              <g transform="translate(52, 68)">
                <circle cx="0" cy="0" r="18" fill="#06080d" stroke="#9B30FF" strokeWidth="2" />
                <circle cx="0" cy="0" r="12" fill="url(#chrome-grad)" />
                <circle cx="0" cy="0" r="6" fill="#06080d" stroke="#B5D300" strokeWidth="1" />
                <line x1="-12" y1="0" x2="12" y2="0" stroke="white" strokeWidth="0.5" />
                <line x1="0" y1="-12" x2="0" y2="12" stroke="white" strokeWidth="0.5" />
                <line x1="-8" y1="-8" x2="8" y2="8" stroke="white" strokeWidth="0.5" />
                <line x1="8" y1="-8" x2="-8" y2="8" stroke="white" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="3" fill="#FF3CB4" />
              </g>

              <g transform="translate(182, 68)">
                <circle cx="0" cy="0" r="18" fill="#06080d" stroke="#9B30FF" strokeWidth="2" />
                <circle cx="0" cy="0" r="12" fill="url(#chrome-grad)" />
                <circle cx="0" cy="0" r="6" fill="#06080d" stroke="#B5D300" strokeWidth="1" />
                <line x1="-12" y1="0" x2="12" y2="0" stroke="white" strokeWidth="0.5" />
                <line x1="0" y1="-12" x2="0" y2="12" stroke="white" strokeWidth="0.5" />
                <line x1="-8" y1="-8" x2="8" y2="8" stroke="white" strokeWidth="0.5" />
                <line x1="8" y1="-8" x2="-8" y2="8" stroke="white" strokeWidth="0.5" />
                <circle cx="0" cy="0" r="3" fill="#FF3CB4" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* sound waves backdrop at the bottom */}
      <div className="bg-decor__wave" aria-hidden="true">
        <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B5D300" stopOpacity="0.08" />
              <stop offset="50%" stopColor="#9B30FF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FF3CB4" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="wave-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF3CB4" stopOpacity="0.05" />
              <stop offset="50%" stopColor="#B5D300" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#9B30FF" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            className="bg-decor__wave-path bg-decor__wave-path--a"
            d="M0 100 Q 360 40, 720 100 T 1440 100 L 1440 200 L 0 200 Z"
            fill="url(#wave-grad)"
          />
          <path
            className="bg-decor__wave-path bg-decor__wave-path--b"
            d="M0 120 Q 360 180, 720 120 T 1440 120 L 1440 200 L 0 200 Z"
            fill="url(#wave-grad-2)"
          />
        </svg>
      </div>

      {/* subtle floating background particles */}
      <div className="bg-decor__particles">
        {Array.from({ length: 18 }).map((_, i) => {
          const colors = ["lime", "violet", "magenta"];
          const color = colors[i % 3];
          const left = `${(i * 7 + 11) % 95}%`;
          const top = `${(i * 13 + 7) % 85}%`;
          const size = 3 + (i % 3); // 3px to 5px
          const dur = 16 + (i % 5) * 4; // 16s to 32s
          const delay = -(i * 1.8) % dur;
          return (
            <span
              key={i}
              className={`bg-decor__particle bg-decor__particle--${color}`}
              style={{
                left,
                top,
                width: `${size}px`,
                height: `${size}px`,
                animationDuration: `${dur}s`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>

      {/* floating musical symbols */}
      <div className="bg-decor__notes">
        {Array.from({ length: 6 }).map((_, i) => {
          const symbols = ["♩", "♪", "♫", "♬", "♯", "♭"];
          const colors = ["lime", "violet", "magenta"];
          const symbol = symbols[i % symbols.length];
          const color = colors[i % 3];
          const left = `${(i * 17 + 23) % 80 + 10}%`;
          const top = `${(i * 19 + 31) % 70 + 15}%`;
          const dur = 22 + (i % 3) * 6; // 22s to 34s
          const delay = -(i * 2.8) % dur;
          return (
            <span
              key={i}
              className={`bg-decor__note bg-decor__note--${color}`}
              style={{
                left,
                top,
                fontSize: `${16 + (i % 3) * 5}px`,
                animationDuration: `${dur}s`,
                animationDelay: `${delay}s`,
              }}
            >
              {symbol}
            </span>
          );
        })}
      </div>

      {/* floating covers — skip ones that failed to sign */}
      {covers.filter((c) => c.url).map((c) => (
        <div
          key={c.path}
          className="bg-decor__cover"
          style={{
            left: c.x,
            top: c.y,
            width: `${c.size}px`,
            height: `${c.size}px`,
            animationDuration: `${c.dur}s, ${c.dur * 2.4}s`,
            animationDelay: `${c.delay}s, ${c.delay * 0.6}s`,
            // @ts-expect-error custom property
            "--spin-dir": c.spinDir,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.url!} alt="" />
        </div>
      ))}

      {/* thin equalizer bars across the bottom */}
      <div className="bg-decor__eq" aria-hidden="true">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="bg-decor__eq-bar"
            style={{
              animationDuration: `${0.6 + (i % 7) * 0.13}s`,
              animationDelay: `${(i * 0.07) % 1.2}s`,
              // @ts-expect-error custom property
              "--h": `${20 + (i * 7) % 80}%`,
            }}
          />
        ))}
      </div>

      {/* a slow horizontal scanline that drifts down the page */}
      <div className="bg-decor__scan" aria-hidden="true" />
    </div>
  );
}
