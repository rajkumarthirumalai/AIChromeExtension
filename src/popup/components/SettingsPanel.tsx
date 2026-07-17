import React from 'react';

interface SettingsPanelProps {
  apiKey: string;
  geminiModel: string;
  groqApiKey: string;
  groqModel: string;
  aiProvider: string;
  onApiKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGeminiModelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onGroqApiKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGroqModelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onAiProviderChange: (val: string) => void;
  onResetStats: () => void;
  onClearCache: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  apiKey,
  geminiModel,
  groqApiKey,
  groqModel,
  aiProvider,
  onApiKeyChange,
  onGeminiModelChange,
  onGroqApiKeyChange,
  onGroqModelChange,
  onAiProviderChange,
  onResetStats,
  onClearCache,
}) => {
  return (
    <section className="bg-surface-container-high border-2 border-outline-variant p-3 flex flex-col gap-3 retro-shadow-secondary">
      <h2 className="font-label-md text-label-sm uppercase text-secondary-container font-bold border-b border-outline-variant pb-1">
        Dojo Settings
      </h2>

      {/* AI Provider Switch */}
      <div className="flex flex-col gap-1">
        <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">AI Provider</span>
        <div className="flex gap-2">
          <button
            onClick={() => onAiProviderChange('gemini')}
            className={`flex-1 py-1.5 font-label-sm text-xs border-2 uppercase font-bold transition-all ${
              aiProvider === 'gemini'
                ? 'bg-tertiary-container text-background border-outline-variant retro-shadow-secondary'
                : 'bg-surface border-outline-variant text-muted hover:text-on-surface'
            }`}
          >
            Gemini
          </button>
          <button
            onClick={() => onAiProviderChange('groq')}
            className={`flex-1 py-1.5 font-label-sm text-xs border-2 uppercase font-bold transition-all ${
              aiProvider === 'groq'
                ? 'bg-primary-container text-parchment border-on-primary-fixed retro-shadow-primary'
                : 'bg-surface border-outline-variant text-muted hover:text-on-surface'
            }`}
          >
            Groq
          </button>
        </div>
      </div>

      {/* Provider Specific Settings */}
      {aiProvider === 'gemini' ? (
        <>
          <div className="flex flex-col gap-1">
            <label htmlFor="gemini-api-key" className="font-label-sm text-[10px] text-on-surface-variant uppercase">
              Gemini API Key
            </label>
            <input
              type="password"
              id="gemini-api-key"
              value={apiKey}
              onChange={onApiKeyChange}
              placeholder="AIzaSy..."
              className="retro-input p-1.5 font-label-md text-xs text-on-background w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="gemini-model" className="font-label-sm text-[10px] text-on-surface-variant uppercase">
              Gemini Model
            </label>
            <select
              id="gemini-model"
              value={geminiModel}
              onChange={onGeminiModelChange}
              className="retro-input p-1.5 font-label-md text-xs text-on-background w-full bg-surface"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            </select>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <label htmlFor="groq-api-key" className="font-label-sm text-[10px] text-on-surface-variant uppercase">
              Groq API Key
            </label>
            <input
              type="password"
              id="groq-api-key"
              value={groqApiKey}
              onChange={onGroqApiKeyChange}
              placeholder="gsk_..."
              className="retro-input p-1.5 font-label-md text-xs text-on-background w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="groq-model" className="font-label-sm text-[10px] text-on-surface-variant uppercase">
              Groq Model
            </label>
            <select
              id="groq-model"
              value={groqModel}
              onChange={onGroqModelChange}
              className="retro-input p-1.5 font-label-md text-xs text-on-background w-full bg-surface"
            >
              <option value="openai/gpt-oss-20b">GPT-OSS 20B (Recommended)</option>
              <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
              <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
            </select>
          </div>
        </>
      )}

      <div className="flex justify-between items-center mt-2 gap-2 border-t border-outline-variant pt-2">
        <button
          onClick={onResetStats}
          className="flex-1 py-1 px-2 bg-surface border-2 border-outline-variant text-muted font-label-sm text-[10px] uppercase font-bold text-center hover:text-on-surface active:translate-y-[1px] transition-all"
        >
          Reset Stats
        </button>
        <button
          onClick={onClearCache}
          className="flex-1 py-1 px-2 bg-surface border-2 border-outline-variant text-muted font-label-sm text-[10px] uppercase font-bold text-center hover:text-on-surface active:translate-y-[1px] transition-all"
        >
          Clear Cache
        </button>
      </div>
    </section>
  );
};
