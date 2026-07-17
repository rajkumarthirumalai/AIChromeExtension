import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { getStorageData, setStorageData } from './utils/storage';
import { SettingsPanel } from './popup/components/SettingsPanel';
import { ShieldToggle } from './popup/components/ShieldToggle';
import { StatsSection } from './popup/components/StatsSection';
import { GoalInput } from './popup/components/GoalInput';

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

  const handleClearCache = async () => {
    await setStorageData({ evaluationCache: {}, domainCache: {} });
    alert('Dojo Cache Cleared!');
  };

  // Determine discipline title based on stats
  let discipline = 'ZEN MASTER';
  if (distractionsSlashed > 5) {
    discipline = 'SLACKER';
  } else if (distractionsSlashed > 2) {
    discipline = 'DISCIPLED';
  } else if (pagesEvaluated > 0 && distractionsSlashed === 0) {
    discipline = 'ZEN MASTER';
  } else if (pagesEvaluated > 0) {
    discipline = 'INITIATE';
  }

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
          <SettingsPanel
            apiKey={apiKey}
            geminiModel={geminiModel}
            groqApiKey={groqApiKey}
            groqModel={groqModel}
            aiProvider={aiProvider}
            onApiKeyChange={handleApiKeyChange}
            onGeminiModelChange={handleGeminiModelChange}
            onGroqApiKeyChange={handleGroqApiKeyChange}
            onGroqModelChange={handleGroqModelChange}
            onAiProviderChange={handleAiProviderChange}
            onResetStats={handleResetStats}
            onClearCache={handleClearCache}
          />
        )}

        {/* Dojo Gate Toggle */}
        <ShieldToggle
          title="Dojo Gate"
          isActive={focusMode}
          activeClass="bg-tertiary-container shadow-[0_0_10px_#30a193]"
          knobActiveClass="border-tertiary-container"
          onToggle={handleToggleFocus}
          statusLabel={focusMode ? 'OPEN' : 'CLOSED'}
          statusClass={focusMode ? 'text-tertiary-container' : 'text-error'}
        />

        {/* YouTube Shield Toggle */}
        <ShieldToggle
          title="YouTube Shield"
          description="Slashes Clickbait"
          isActive={ytShield}
          activeClass="bg-primary-container shadow-[0_0_10px_#ff535b]"
          knobActiveClass="border-primary-container"
          onToggle={handleToggleYtShield}
          statusLabel={ytShield ? 'ACTIVE' : 'INACTIVE'}
          statusClass={ytShield ? 'text-primary-container' : 'text-muted'}
        />

        {/* Training Goal Input */}
        <GoalInput value={focusGoal} onChange={handleGoalChange} />

        {/* Sparring Stats */}
        <StatsSection
          pagesEvaluated={pagesEvaluated}
          distractionsSlashed={distractionsSlashed}
        />
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
