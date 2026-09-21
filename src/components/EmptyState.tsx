import { Terminal as TerminalIcon } from "lucide-react";

interface Props {
  mode?: string;
}

export default function EmptyState({ mode = "PENTEST" }: Props) {
  return (
    <div className="flex flex-col items-center px-2 pt-10 text-center">
      <div className="glass-panel relative grid size-[76px] place-items-center rounded-[20px] shadow-[0_0_38px_rgba(34,211,238,0.35)]">
        <div className="absolute inset-2 rounded-[14px] border border-term-cyan/20" />
        <TerminalIcon
          className="size-8 text-term-cyan drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]"
          strokeWidth={1.5}
        />
      </div>

      <p className="mt-5 text-[10px] tracking-wider text-term-dim">
        SECURE CHANNEL // {mode.toUpperCase()}
      </p>

      <h2 className="mt-1.5 text-[15px] font-semibold text-slate-100">
        AWAITING OPERATOR INPUT
        <span className="ml-1 text-term-green">_</span>
      </h2>
    </div>
  );
}