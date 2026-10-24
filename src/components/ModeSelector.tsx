import type { Mode } from "../types/settings";

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const MODES: { id: Mode; label: string }[] = [
  { id: "PENTEST", label: "Pentest" },
  { id: "CODE", label: "Code" },
  { id: "IOT", label: "IoT Lab" },
  { id: "DEFENSE", label: "Defense" },
];

export default function ModeSelector({ mode, onChange }: Props) {
  return (
    <div className="flex items-center justify-center p-3 border-b border-border/50 bg-bg">
      <div className="flex gap-1 p-1 bg-[#1c1c1e] rounded-xl">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              mode === m.id
                ? "bg-[#3a3a3c] text-white shadow-sm"
                : "text-text-muted hover:text-white hover:bg-white/5"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
