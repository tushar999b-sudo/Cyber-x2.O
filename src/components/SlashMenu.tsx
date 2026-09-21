import type { SlashCommand } from "../config/slashCommands";

interface Props {
  commands: SlashCommand[];
  activeIndex: number;
  onSelect: (cmd: SlashCommand) => void;
  onHover: (index: number) => void;
}

export default function SlashMenu({
  commands,
  activeIndex,
  onSelect,
  onHover,
}: Props) {
  if (commands.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 z-40 mb-2">
      <div className="glass-panel max-h-64 overflow-y-auto rounded-2xl border border-white/10 p-1.5 shadow-2xl">
        <div className="px-2 py-1 text-[9px] uppercase tracking-wider text-term-dim">
          Slash Commands
        </div>
        <ul>
          {commands.map((cmd, idx) => {
            const Icon = cmd.icon;
            const active = idx === activeIndex;
            return (
              <li key={cmd.trigger}>
                <button
                  type="button"
                  onMouseEnter={() => onHover(idx)}
                  onClick={() => onSelect(cmd)}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors",
                    active
                      ? "bg-term-cyan/10 ring-1 ring-inset ring-term-cyan/30"
                      : "hover:bg-white/5",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex size-7 shrink-0 items-center justify-center rounded-lg",
                      active
                        ? "bg-term-cyan/15 text-term-cyan"
                        : "bg-white/5 text-term-dim",
                    ].join(" ")}
                  >
                    <Icon size={13} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={[
                        "block text-[11px] font-medium",
                        active ? "text-term-cyan" : "text-slate-200",
                      ].join(" ")}
                    >
                      {cmd.trigger}
                      <span className="ml-2 text-[10px] font-normal text-term-dim">
                        {cmd.label}
                      </span>
                    </span>
                    <span className="block truncate text-[10px] text-term-dim">
                      {cmd.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="px-2 py-1 text-[9px] text-term-dim">
          ↑ ↓ navigate · Enter select · Esc close
        </div>
      </div>
    </div>
  );
}