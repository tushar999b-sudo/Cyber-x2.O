import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or private browsing — fail silently
    }
  }, [key, value]);

  const set = useCallback<React.Dispatch<React.SetStateAction<T>>>(
    (v) => setValue(v),
    []
  );

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    setValue(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, set, reset];
}