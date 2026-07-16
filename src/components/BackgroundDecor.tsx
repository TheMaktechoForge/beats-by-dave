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
