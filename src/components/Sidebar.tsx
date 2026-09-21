import { Plus, Trash2, X } from "lucide-react";
import type { Conversation } from "../types/chat";
import { formatDateTime, truncate } from "../utils/format";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  isOpen: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onClose: () => void;
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
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 sm:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[80vw] max-w-[300px] flex-col border-r border-border bg-panel transition-transform duration-200 sm:static sm:z-auto sm:w-64 sm:max-w-none sm:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-term-cyan">
            Sessions
          </span>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-term-dim hover:bg-white/5 hover:text-slate-100 sm:hidden"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <button
          onClick={onNew}
          className="mx-3 mt-3 flex items-center justify-center gap-2 rounded-lg border border-term-cyan/30 bg-term-cyan/5 py-2 text-xs font-medium text-term-cyan transition hover:bg-term-cyan/10"
        >
          <Plus size={14} /> New Session
        </button>

        <div className="mt-3 flex-1 overflow-y-auto px-2 pb-2">
          {conversations.length === 0 ? (
            <p className="py-6 text-center text-[11px] text-term-dim">
              No sessions yet
            </p>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <li key={c.id}>
                    <div
                      onClick={() => {
                        onSelect(c.id);
                        onClose();
                      }}
                      className={`group flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 transition ${
                        isActive
                          ? "bg-term-cyan/10 ring-1 ring-inset ring-term-cyan/30"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-xs font-medium ${
                            isActive ? "text-term-cyan" : "text-slate-300"
                          }`}
                        >
                          {c.title || truncate("New session")}
                        </p>
                        <p className="mt-0.5 text-[10px] text-term-dim">
                          {formatDateTime(c.updatedAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(c.id);
                        }}
                        className="p-1 text-term-dim opacity-60 transition hover:text-term-red sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Delete session"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-border px-3 py-2 text-center text-[10px] text-term-dim">
          {conversations.length} session
          {conversations.length === 1 ? "" : "s"}
        </div>
      </aside>
    </>
  );
}