export function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncate(text: string, max = 42): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}