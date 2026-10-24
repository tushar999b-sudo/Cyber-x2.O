import { Plus, Trash2, X } from "lucide-react";
import type { Conversation } from "../types/chat";
import { formatDateTime, truncate } from "../utils/format";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export default function Sidebar({
  conversations,
  activeId,
  isOpen,
  onSelect,
  onDelete,
  onNew,
  onClose,
}: Props) {
  return (
    <>
      {/* Background Overlay - Jab sidebar khulega tab piche ka area dark ho jayega */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sliding Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border/50 bg-panel transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Sessions
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:bg-white/5 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={() => {
              onNew();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <Plus size={16} /> New Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-center text-xs text-text-muted py-8">
              No sessions yet
            </p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  onSelect(c.id);
                  onClose();
                }}
                className={`group flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 transition-colors ${
                  activeId === c.id
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      activeId === c.id ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {c.title || truncate("New session")}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {formatDateTime(c.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
                  className="p-1.5 text-text-muted opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
