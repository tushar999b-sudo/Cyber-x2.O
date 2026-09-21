import { useEffect, type RefObject } from "react";

export function useAutoScroll(
  ref: RefObject<HTMLElement>,
  deps: unknown[]
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}