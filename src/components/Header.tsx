import { Menu, Plus, RotateCcw, Settings, Wrench } from "lucide-react";
import { APP_NAME, APP_VERSION } from "../config/appConfig";

interface Props {
  status: "idle" | "streaming" | "error";
  onOpenSettings: () => void;
  onOpenToolbox: () => void;
  onClear: () => void;
  onNewSession: () => void;
  onToggleSidebar: () => void;
}

export default function Header({
  status,
  onOpenSettings,
  onOpenToolbox,
  onClear,
  onNewSession,
  onToggleSidebar,
}: Props) {
  const statusLabel =
    status === "streaming"
      ? "PROCESSING"
      : status === "error"
      ? "SYSTEM ERROR"
      : "SYSTEM ONLINE";

  const statusColor =
    status === "streaming"
      ? "bg-term-cyan shadow-[0_0_7px_rgba(34,211,238,0.9)]"
      : status === "error"
      ? "bg-term-red shadow-[0_0_7px_rgba(244,63,94,0.9)]"
      : "bg-term-green shadow-[0_0_7px_rgba(16,229,160,0.9)]";

  return (
    <header className="glass-panel z-20 mx-3 mt-3 flex min-h-[64px] items-center gap-1.5 rounded-[20px] px-2.5">
      <button
        onClick={onToggleSidebar}
        aria-label="Open menu"
        className="glass-control flex size-8 shrink-0 items-center justify-center rounded-xl text-term-dim transition-colors hover:text-slate-100"
      >
        <Menu size={15} />
      </button>

      <svg
        viewBox="0 0 24 24"
        className="size-7 shrink-0 text-term-green"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" />
        <path
          d="M9.5 10L12 12.5L9.5 15"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M13.5 15H15.5" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[12px] font-bold tracking-wide text-term-green">
          {APP_NAME}
        </h1>
        <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-term-dim">
          <span
            className={`size-1.5 rounded-full ${statusColor} animate-signal-pulse`}
          />
          {statusLabel}
        </div>
      </div>

      <span className="hidden rounded-full border border-border bg-glass px-1.5 py-1 text-[7px] text-term-dim min-[360px]:inline">
        v{APP_VERSION}
      </span>

      <HeaderAction label="New session" onClick={onNewSession}>
        <Plus size={14} />
      </HeaderAction>
      <HeaderAction label="Clear console" onClick={onClear}>
        <RotateCcw size={14} />
      </HeaderAction>
      <HeaderAction label="Toolbox" onClick={onOpenToolbox}>
        <Wrench size={14} />
      </HeaderAction>
      <HeaderAction label="Settings" onClick={onOpenSettings}>
        <Settings size={14} />
      </HeaderAction>
    </header>
  );
}

function HeaderAction({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-8 shrink-0 items-center justify-center rounded-xl text-term-dim transition-colors hover:bg-glass-strong hover:text-term-cyan"
    >
      {children}
    </button>
  );
}