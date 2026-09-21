import { Boxes, Braces, Radar, ShieldCheck } from "lucide-react";
import type { Mode } from "../types/settings";

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const MODES: { id: Mode; label: string; icon: typeof Radar }[] = [
  { id: "PENTEST", label: "PENTEST", icon: Radar },
  { id: "CODE", label: "CODE", icon: Braces },
  { id: "IOT", label: "IoT LAB", icon: Boxes },
  { id: "DEFENSE", label: "DEFENSE", icon: ShieldCheck },
];

export default function ModeSelector({ mode, onChange }: Props) {
  return (
    <nav
      aria-label="Operation mode"
      className="glass-panel z-10 mx-3 mt-3 grid grid-cols-4 gap-1 rounded-[18px] p-1.5"
    >
      {MODES.map(({ id, label, icon: Icon }) => {
        const selected = mode === id;
        return (
          <button
            key={id}
            aria-pressed={selected}
            onClick={() => onChange(id)}
            className={[
              "flex h-10 items-center justify-center gap-1 rounded-[13px] px-1 text-[9px] font-medium transition-all",
              selected
                ? "border border-term-cyan/60 bg-term-cyan/10 text-term-cyan shadow-[0_0_18px_rgba(34,211,238,0.4)]"
                : "border border-transparent text-term-dim hover:bg-glass hover:text-slate-100",
            ].join(" ")}
          >
            <Icon size={14} />
            <span className="hidden min-[360px]:inline">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}