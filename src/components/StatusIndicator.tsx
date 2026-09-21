interface StatusIndicatorProps {
  status: "idle" | "streaming" | "error";
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = {
    idle: {
      dot: "bg-term-green",
      label: "READY",
      labelColor: "text-term-dim",
      anim: "",
    },
    streaming: {
      dot: "bg-term-cyan",
      label: "PROCESSING...",
      labelColor: "text-term-cyan",
      anim: "animate-pulse",
    },
    error: {
      dot: "bg-term-red",
      label: "ERROR",
      labelColor: "text-term-red",
      anim: "",
    },
  }[status];

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`w-2 h-2 rounded-full ${config.dot} ${config.anim}`}
        aria-hidden="true"
      />
      <span className={`font-mono ${config.labelColor}`}>{config.label}</span>
    </div>
  );
}