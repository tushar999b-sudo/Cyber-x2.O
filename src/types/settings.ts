export interface ProviderConfig {
  id: string;
  label: string;
  baseUrl: string;
  defaultModel: string;
  models: string[];
  keyLabel: string;
  keyPlaceholder: string;
}

export type Density = "compact" | "comfortable";

export interface Settings {
  provider: string;
  model: string;
  customModel: string;
  temperature: number;
  streaming: boolean;
  density: Density;
}

export type Mode = "PENTEST" | "CODE" | "IOT" | "DEFENSE";