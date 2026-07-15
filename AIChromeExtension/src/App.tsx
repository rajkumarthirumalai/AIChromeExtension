import React, { useEffect, useState } from 'react';
import { Settings, FileText, Swords, Eye } from 'lucide-react';

// Wrapper for chrome.storage.local with localStorage fallback for development
const getStorageData = async (keys: string[]): Promise<Record<string, any>> => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  } else {
    const result: Record<string, any> = {};
    for (const key of keys) {
      const val = localStorage.getItem(key);
      if (val !== null) {
        try {
          result[key] = JSON.parse(val);
        } catch {
          result[key] = val;
        }
      }
    }
    return result;
  }
};

const setStorageData = async (data: Record<string, any>): Promise<void> => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  } else {
    for (const [key, val] of Object.entries(data)) {
      localStorage.setItem(key, JSON.stringify(val));
    }
  }
};

export default function App() {
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [focusGoal, setFocusGoal] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>(''); // Maps to geminiApiKey
  const [geminiModel, setGeminiModel] = useState<string>('gemini-2.5-flash');
  const [groqApiKey, setGroqApiKey] = useState<string>('');
  const [groqModel, setGroqModel] = useState<string>('openai/gpt-oss-20b');
  const [aiProvider, setAiProvider] = useState<string>('gemini');
  const [pagesEvaluated, setPagesEvaluated] = useState<number>(0);
  const [distractionsSlashed, setDistractionsSlashed] = useState<number>(0);
  const [ytShield, setYtShield] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Load state on mount
  useEffect(() => {
    const loadState = async () => {
      const data = await getStorageData([
        'focusMode',
        'focusGoal',
        'geminiApiKey',
        'geminiModel',
        'groqApiKey',
        'groqModel',
        'aiProvider',
        'pagesEvaluated',
        'distractionsSlashed',
        'ytShield',
      ]);
      setFocusMode(!!data.focusMode);
      setFocusGoal(data.focusGoal || '');
      setApiKey(data.geminiApiKey || '');
      setGeminiModel(data.geminiModel || 'gemini-2.5-flash');
      setGroqApiKey(data.groqApiKey || '');
      setGroqModel(data.groqModel || 'openai/gpt-oss-20b');
      setAiProvider(data.aiProvider || 'gemini');
      setPagesEvaluated(Number(data.pagesEvaluated) || 0);
      setDistractionsSlashed(Number(data.distractionsSlashed) || 0);
      setYtShield(!!data.ytShield);
    };
    loadState();
  }, []);

  // Save states on change
  const handleToggleFocus = async () => {
    const nextMode = !focusMode;
    setFocusMode(nextMode);
    await setStorageData({ focusMode: nextMode });
  };

  const handleToggleYtShield = async () => {
    const nextYt = !ytShield;
    setYtShield(nextYt);
    await setStorageData({ ytShield: nextYt });
  };

  const handleGoalChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFocusGoal(val);
    await setStorageData({ focusGoal: val });
  };

  const handleApiKeyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    await setStorageData({ geminiApiKey: val });
  };

  const handleGeminiModelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setGeminiModel(val);
    await setStorageData({ geminiModel: val });
  };

  const handleGroqApiKeyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGroqApiKey(val);
    await setStorageData({ groqApiKey: val });
  };

  const handleGroqModelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setGroqModel(val);
    await setStorageData({ groqModel: val });
  };

  const handleAiProviderChange = async (val: string) => {
    setAiProvider(val);
    await setStorageData({ aiProvider: val });
  };

  const handleResetStats = async () => {
    setPagesEvaluated(0);
    setDistractionsSlashed(0);
    await setStorageData({ pagesEvaluated: 0, distractionsSlashed: 0 });
  };

  // Calculate stamina based on stats
  const total = pagesEvaluated;
  const slashed = distractionsSlashed;
  const stamina = total > 0 ? Math.max(10, Math.round(((total - slashed) / total) * 100)) : 100;

  // Discipline rating
  let discipline = 'ZEN MASTER';
  if (slashed > 5) {
    discipline = 'SLACKER';
  } else if (slashed > 2) {
    discipline = 'DISCIPLED';
  } else if (total > 0 && slashed === 0) {
    discipline = 'ZEN MASTER';
  } else if (total > 0) {
    discipline = 'INITIATE';
  }

  // Segment counts for health bar (10 segments total)
  const activeSegments = Math.round(stamina / 10);

  return (
    <div className="bg-background text-on-background w-[360px] h-[550px] overflow-y-auto flex flex-col m-0 p-0 font-body-md">
      {/* TopAppBar */}
      <header className="bg-background border-b-[3px] border-outline-variant shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center w-full px-4 py-3 z-10 shrink-0">
        <div className="flex flex-col">
          <h1 className="font-headline-md text-[20px] font-black text-secondary-container tracking-tighter uppercase">
            OJI-SAN'S DOJO
          </h1>
          <div className="bg-error-container text-parchment font-label-sm text-[10px] px-2 py-0.5 mt-1 inline-block border-[2px] border-on-error-container self-start">
            DISCIPLINE: {discipline}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`cursor-pointer hover:text-secondary-container transition-colors flex items-center justify-center ${
              showSettings ? 'text-secondary-container' : 'text-muted'
            }`}
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 flex flex-col gap-4 bg-surface">
        {/* Settings Expander */}
        {showSettings && (
          <section className="bg-surface-container-high border-2 border-outline-variant p-3 flex flex-col gap-3 retro-shadow-secondary">
            <h2 className="font-label-md text-label-sm uppercase text-secondary-container font-bold border-b border-outline-variant pb-1">
              Dojo Settings
            </h2>

            {/* AI Provider Switch */}
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase">AI Provider</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAiProviderChange('gemini')}
                  className={`flex-1 py-1.5 font-label-sm text-xs border-2 uppercase font-bold transition-all ${
                    aiProvider === 'gemini'
                      ? 'bg-tertiary-container text-background border-outline-variant retro-shadow-secondary'
                      : 'bg-surface border-outline-variant text-muted hover:text-on-surface'
                  }`}
                >
                  Gemini
                </button>
                <button
                  onClick={() => handleAiProviderChange('groq')}
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
                    onChange={handleApiKeyChange}
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
                    onChange={handleGeminiModelChange}
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
                    onChange={handleGroqApiKeyChange}
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
                    onChange={handleGroqModelChange}
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
                onClick={handleResetStats}
                className="flex-1 py-1 px-2 bg-surface border-2 border-outline-variant text-muted font-label-sm text-[10px] uppercase font-bold text-center hover:text-on-surface active:translate-y-[1px] transition-all"
              >
                Reset Stats
              </button>
              <button
                onClick={async () => {
                  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                    await setStorageData({ evaluationCache: {} });
                    alert('Evaluation cache cleared!');
                  }
                }}
                className="flex-1 py-1 px-2 bg-surface border-2 border-outline-variant text-muted font-label-sm text-[10px] uppercase font-bold text-center hover:text-on-surface active:translate-y-[1px] transition-all"
              >
                Clear Cache
              </button>
            </div>
          </section>
        )}

        {/* Dojo Gate Toggle */}
        <section className="bg-surface-container-low retro-border p-4 flex justify-between items-center">
          <h2 className="font-label-md text-label-md uppercase text-on-surface">Dojo Gate</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleFocus}
              className={`w-16 h-8 rounded-full border-2 border-outline-variant relative transition-colors duration-200 focus:outline-none ${
                focusMode ? 'bg-tertiary-container shadow-[0_0_10px_#30a193]' : 'bg-error'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full border-[3px] transition-all duration-200 cursor-pointer ${
                  focusMode
                    ? 'right-0.5 bg-background border-tertiary-container'
                    : 'left-0.5 bg-background border-error'
                }`}
              />
            </button>
          </div>
          <div
            className={`font-label-md text-label-md uppercase font-bold ${
              focusMode ? 'text-tertiary-container' : 'text-error'
            }`}
          >
            {focusMode ? 'OPEN' : 'CLOSED'}
          </div>
        </section>

        {/* YouTube Shield Toggle */}
        <section className="bg-surface-container-low retro-border p-4 flex justify-between items-center">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-label-md text-label-md uppercase text-on-surface leading-none">YouTube Shield</h2>
            <span className="text-[9px] text-muted font-label-sm uppercase tracking-tight">Slashes Clickbait</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleYtShield}
              className={`w-16 h-8 rounded-full border-2 border-outline-variant relative transition-colors duration-200 focus:outline-none ${
                ytShield ? 'bg-primary-container shadow-[0_0_10px_#ff535b]' : 'bg-surface-variant'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full border-[3px] transition-all duration-200 cursor-pointer ${
                  ytShield
                    ? 'right-0.5 bg-background border-primary-container'
                    : 'left-0.5 bg-background border-outline'
                }`}
              />
            </button>
          </div>
          <div
            className={`font-label-md text-label-md uppercase font-bold ${
              ytShield ? 'text-primary-container' : 'text-muted'
            }`}
          >
            {ytShield ? 'ACTIVE' : 'INACTIVE'}
          </div>
        </section>

        {/* Training Goal Input */}
        <section className="bg-surface-container-low retro-border p-4 flex flex-col gap-2">
          <label htmlFor="goal" className="font-label-md text-label-md uppercase text-on-surface">
            Set your Training Goal
          </label>
          <input
            type="text"
            id="goal"
            value={focusGoal}
            onChange={handleGoalChange}
            placeholder="e.g. Learning React, AWS Cert..."
            className="retro-input p-2 font-body-md text-body-md text-on-background w-full"
          />
          <div className="flex items-center gap-2 text-error font-label-sm text-[11px] mt-1">
            <Eye className="w-[16px] h-[16px]" />
            <p>Warning: Oji-San is watching.</p>
          </div>
        </section>

        {/* Sparring Stats */}
        <section className="bg-surface-container-low retro-border p-4 flex flex-col gap-3">
          <h2 className="font-label-md text-label-md uppercase text-secondary-container border-b-2 border-outline-variant pb-1 mb-1">
            Today's Sparring Stats
          </h2>

          {/* Health Bar (Focus Stamina) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Focus Stamina</span>
              <span className="font-label-sm text-label-sm text-secondary-container font-bold">{stamina}%</span>
            </div>
            <div className="health-bar-container">
              <div className="health-bar-fill" style={{ width: `${stamina}%` }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`health-segment ${i < activeSegments ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Text Stats */}
          <div className="flex justify-between items-center bg-surface p-2 border-[2px] border-outline-variant mt-1">
            <div className="flex items-center gap-2">
              <FileText className="w-[18px] h-[18px] text-tertiary" />
              <span className="font-label-md text-label-md text-on-surface">Pages Evaluated</span>
            </div>
            <span className="font-headline-md text-[20px] text-secondary-container">{pagesEvaluated}</span>
          </div>

          <div className="flex justify-between items-center bg-surface p-2 border-[2px] border-outline-variant">
            <div className="flex items-center gap-2">
              <Swords className="w-[18px] h-[18px] text-error" />
              <span className="font-label-md text-label-md text-on-surface">Distractions Slashed</span>
            </div>
            <span className="font-headline-md text-[20px] text-primary-container">{distractionsSlashed}</span>
          </div>
        </section>
      </main>

      {/* Footer Quote */}
      <footer className="bg-surface-container-lowest border-t-[3px] border-outline-variant py-2.5 px-4 shrink-0 flex items-center justify-center text-center shadow-[0px_-4px_0px_0px_rgba(0,0,0,1)] relative z-10">
        <p className="font-body-md text-xs text-muted italic">
          "To compile code without errors, one must first compile a focused mind."
          <br />- Master Oji-San
        </p>
      </footer>
    </div>
  );
}
