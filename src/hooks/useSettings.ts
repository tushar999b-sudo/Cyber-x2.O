import { useCallback } from "react";
import { PROVIDERS, STORAGE_KEYS } from "../config/appConfig";
import type { Settings } from "../types/settings";
import { useLocalStorage } from "./useLocalStorage";

const DEFAULT_SETTINGS: Settings = {
  provider: "groq",
  model: PROVIDERS.groq.defaultModel,
  customModel: "",
  temperature: 0.4,
  streaming: true,
  density: "comfortable",
};

export function useSettings() {
  const [settings, setSettings, resetSettings] = useLocalStorage<Settings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS
  );
  const [apiKey, setApiKey, clearKeyStorage] = useLocalStorage<string>(
    STORAGE_KEYS.apiKey,
    ""
  );

  const updateSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [setSettings]
  );

  const clearKey = useCallback(() => {
    clearKeyStorage();
  }, [clearKeyStorage]);

  const resetAll = useCallback(() => {
    resetSettings();
    clearKeyStorage();
  }, [resetSettings, clearKeyStorage]);

  const resolvedModel =
    settings.model === "custom" && settings.customModel
      ? settings.customModel
      : settings.model;

  const providerConfig = PROVIDERS[settings.provider] ?? PROVIDERS.groq;

  return {
    settings,
    apiKey,
    resolvedModel,
    providerConfig,
    updateSetting,
    setApiKey,
    clearKey,
    resetAll,
  };
}