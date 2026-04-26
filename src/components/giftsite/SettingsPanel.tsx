import type { UiClasses } from "../../types/giftSite";

interface SettingsPanelProps {
  uiClasses: UiClasses;
  apiKey: string;
  envApiKey: string;
  onApiKeyChange: (value: string) => void;
}

export default function SettingsPanel({
  uiClasses,
  apiKey,
  envApiKey,
  onApiKeyChange,
}: SettingsPanelProps) {
  return (
    <section className="mb-4 rounded-xl border bg-card p-4 shadow-sm">
      <label htmlFor="apiKeyInput" className={uiClasses.label}>
        Gemini API key override (optional if .env has VITE_GEMINI_API_KEY)
      </label>
      <input
        id="apiKeyInput"
        className={uiClasses.field}
        type="password"
        value={apiKey}
        onChange={(event) => onApiKeyChange(event.target.value)}
        placeholder={
          envApiKey
            ? "Using .env key by default (optional override here)"
            : "Paste your API key"
        }
        autoComplete="off"
      />
    </section>
  );
}
