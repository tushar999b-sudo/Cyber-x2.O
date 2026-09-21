import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechRecognitionOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  reset: () => void;
}

export function useSpeechRecognition({
  lang = "en-US",
  onResult,
  onError,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wantListeningRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);
  const lastFinalRef = useRef("");
  const callbacksRef = useRef({ onResult, onError });

  callbacksRef.current = { onResult, onError };

  const isSupported =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) return;

    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition!;
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      const combined = (final || interim).trim();
      setTranscript(combined);

      if (final && final.trim() !== lastFinalRef.current) {
        lastFinalRef.current = final.trim();
        callbacksRef.current.onResult?.(final.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const msg = event.error || "unknown";
      if (msg === "no-speech" || msg === "aborted") return;

      if (msg === "not-allowed" || msg === "service-not-allowed") {
        setError("Microphone permission denied.");
        wantListeningRef.current = false;
        setIsListening(false);
        return;
      }
      setError(msg);
      callbacksRef.current.onError?.(msg);
    };

    recognition.onend = () => {
      setIsListening(false);

      if (wantListeningRef.current) {
        // Longer delay avoids Android Chrome's rapid-restart oscillation.
        // 500ms is enough to release the mic cleanly.
        if (restartTimerRef.current) {
          window.clearTimeout(restartTimerRef.current);
        }
        restartTimerRef.current = window.setTimeout(() => {
          if (!wantListeningRef.current) return;
          try {
            recognition.start();
          } catch {
            // Retry once more with a longer delay
            restartTimerRef.current = window.setTimeout(() => {
              if (!wantListeningRef.current) return;
              try {
                recognition.start();
              } catch {
                wantListeningRef.current = false;
                setIsListening(false);
              }
            }, 800);
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      wantListeningRef.current = false;
      if (restartTimerRef.current) window.clearTimeout(restartTimerRef.current);
      try {
        recognition.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [lang, isSupported]);

  const ensurePermission = useCallback(async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return true;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      return false;
    }
  }, []);

  const start = useCallback(() => {
    void (async () => {
      const recognition = recognitionRef.current;
      if (!recognition) return;

      setTranscript("");
      setError(null);
      lastFinalRef.current = "";

      const permitted = await ensurePermission();
      if (!permitted) {
        setError("Microphone permission denied.");
        return;
      }

      wantListeningRef.current = true;
      try {
        recognition.start();
      } catch {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
        restartTimerRef.current = window.setTimeout(() => {
          if (!wantListeningRef.current) return;
          try {
            recognition.start();
          } catch {
            wantListeningRef.current = false;
            setIsListening(false);
          }
        }, 300);
      }
    })();
  }, [ensurePermission]);

  const stop = useCallback(() => {
    wantListeningRef.current = false;
    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (wantListeningRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  const reset = useCallback(() => {
    setTranscript("");
    setError(null);
    lastFinalRef.current = "";
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    start,
    stop,
    toggle,
    reset,
  };
}