"use client";

export default function ProcessingAnimation() {
  return (
    <div className="flex flex-col items-center gap-6 py-10">
      {/* Waveform — the signature element */}
      <div className="flex items-center gap-[3px] h-16">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="wave-bar block w-1 rounded-full bg-accent"
            style={{
              height: "100%",
              animationDelay: `${i * 0.05}s`,
              animationDuration: `${0.8 + (i % 4) * 0.15}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center">
        <p className="text-white font-medium text-sm">Extracting transcript…</p>
        <p className="text-text-muted text-xs mt-1">This usually takes a few seconds</p>
      </div>
    </div>
  );
}
