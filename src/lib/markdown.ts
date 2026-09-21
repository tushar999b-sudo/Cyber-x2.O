import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export const REMARK_PLUGINS = [remarkGfm];
export const REHYPE_PLUGINS = [rehypeHighlight];

export const MARKDOWN_WRAPPER_CLASS =
  "text-term-green break-words prose-invert prose-sm max-w-none prose-p:my-1.5 prose-headings:text-term-green prose-headings:my-2 prose-a:text-term-cyan prose-strong:text-term-green prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5";

// Alias used by MessageBubble.tsx
export const markdownProseClasses = MARKDOWN_WRAPPER_CLASS;