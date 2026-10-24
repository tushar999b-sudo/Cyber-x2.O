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
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-bg z-20 sticky top-0">
      <div className="flex items-center gap-3">
        {/* Hamburger menu - ab desktop pe bhi dikhega */}
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-text-muted hover:bg-white/5 hover:text-white transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold text-lg shadow-sm">
            X
          </div>
          <div>
            <h1 className="text-white font-semibold tracking-wide text-sm">
              {APP_NAME}
            </h1>
            <p className="text-text-muted text-[10px] tracking-wider uppercase">
              v{APP_VERSION}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onNewSession}
          className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title="New Session"
        >
          <Plus size={18} />
        </button>
        <button
          onClick={onClear}
          className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title="Clear Chat"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={onOpenToolbox}
          className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title="Toolbox"
        >
          <Wrench size={18} />
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
