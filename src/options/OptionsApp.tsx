import React, { useEffect, useState } from 'react';
import { Save, RotateCcw, Trash2, Key, Cpu, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { getStorageData, setStorageData } from '../utils/storage';
import { ojiSanBase64 } from '../assets/oji-san-base64';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function OptionsApp() {
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [geminiModel, setGeminiModel] = useState<string>('gemini-2.5-flash');
  const [groqApiKey, setGroqApiKey] = useState<string>('');
  const [groqModel, setGroqModel] = useState<string>('openai/gpt-oss-20b');
  const [aiProvider, setAiProvider] = useState<string>('gemini');

  // Whitelist and Blocklist states
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [domainCache, setDomainCache] = useState<Record<string, { isProductive: boolean; scoldingMessage: string }>>({});
  const [urlCache, setUrlCache] = useState<Record<string, { isProductive: boolean; scoldingMessage: string }>>({});
  const [newWhitelistDomain, setNewWhitelistDomain] = useState<string>('');

  // UI States
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load configuration from storage on mount
  const loadConfig = async () => {
    const data = await getStorageData([
      'geminiApiKey',
      'geminiModel',
      'groqApiKey',
      'groqModel',
      'aiProvider',
      'bypassUrls',
      'domainCache',
      'evaluationCache'
    ]);
    setGeminiApiKey(data.geminiApiKey || '');
    setGeminiModel(data.geminiModel || 'gemini-2.5-flash');
    setGroqApiKey(data.groqApiKey || '');
    setGroqModel(data.groqModel || 'openai/gpt-oss-20b');
    setAiProvider(data.aiProvider || 'gemini');
    setWhitelist(data.bypassUrls || []);
    setDomainCache(data.domainCache || {});
    setUrlCache(data.evaluationCache || {});
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  // Close toast automatically
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await setStorageData({
        geminiApiKey,
        geminiModel,
        groqApiKey,
        groqModel,
        aiProvider
      });
      showToast('Settings saved! Oji-San approved your training weapons.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings. Check permissions.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Reset Stats
  const handleResetStats = async () => {
    if (window.confirm('Are you sure you want to wipe your Dojo combat record? This resets Pages Evaluated and Distractions Slashed to 0.')) {
      await setStorageData({ pagesEvaluated: 0, distractionsSlashed: 0 });
      showToast('Combat records successfully wiped. Fresh start, disciple!', 'info');
    }
  };

  // Handle Clear Cache
  const handleClearCache = async () => {
    await setStorageData({ evaluationCache: {}, domainCache: {} });
    setDomainCache({});
    setUrlCache({});
    showToast('Dojo evaluation cache cleared. All sites will be checked afresh.', 'info');
  };

  // Handle Add Whitelist Domain
  const handleAddWhitelistDomain = async () => {
    const trimmed = newWhitelistDomain.trim().toLowerCase();
    if (!trimmed) return;
    
    // Simple domain regex validation
    const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;
    const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(trimmed);
    const isLocalhost = trimmed === 'localhost';

    if (!domainRegex.test(trimmed) && !isIp && !isLocalhost) {
      showToast('Please enter a valid domain (e.g. netflix.com or www.netflix.com)', 'error');
      return;
    }

    if (whitelist.includes(trimmed)) {
      showToast('Domain is already whitelisted.', 'info');
      return;
    }

    const updated = [...whitelist, trimmed];
    setWhitelist(updated);
    await setStorageData({ bypassUrls: updated });
    setNewWhitelistDomain('');
    showToast(`Whitelisted: ${trimmed}`, 'success');
  };

  // Handle Remove Whitelist Domain
  const handleRemoveWhitelistDomain = async (domain: string) => {
    const updated = whitelist.filter(item => item !== domain);
    setWhitelist(updated);
    await setStorageData({ bypassUrls: updated });
    showToast(`Removed ${domain} from Whitelist`, 'info');
  };

  // Handle Remove Blocked Domain
  const handleRemoveBlockedDomain = async (domain: string) => {
    const updated = { ...domainCache };
    delete updated[domain];
    setDomainCache(updated);
    await setStorageData({ domainCache: updated });
    showToast(`Unblocked domain: ${domain}`, 'success');
  };

  // Handle Remove Blocked URL
  const handleRemoveBlockedUrl = async (url: string) => {
    const updated = { ...urlCache };
    delete updated[url];
    setUrlCache(updated);
    await setStorageData({ evaluationCache: updated });
    showToast(`Unblocked specific page`, 'success');
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-body-md select-none relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMxYjFiMWQiIGZpbGwtb3BhY2l0eT0iMC4zIi8+PC9zdmc+')] pb-16">
      
      {/* Dynamic Overlay Toast Banner */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-[slideDown_0.2s_ease-out]">
          <div className={`flex items-center gap-3 px-6 py-4 border-[3px] border-outline-variant rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-sm md:text-base font-bold uppercase tracking-tight ${
            toast.type === 'success' ? 'bg-tertiary-container text-background' :
            toast.type === 'error' ? 'bg-error-container text-parchment' :
            'bg-surface-variant text-on-surface'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-6 h-6 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-6 h-6 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="w-6 h-6 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-12 flex flex-col justify-center">
        
        {/* Page Header */}
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-4xl">⚔️</span>
            <h1 className="font-headline-xl text-3xl md:text-5xl font-black text-secondary-container tracking-tighter uppercase leading-none">
              Dojo Command Center
            </h1>
          </div>
          <p className="text-muted text-sm md:text-base italic">
            "Configure your training weights and keys here. Oji-San's eye is unblinking."
          </p>
        </header>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Oji-San Guide Sprite */}
          <div className="lg:col-span-4 bg-surface border-[3px] border-outline-variant p-6 rounded-xl retro-shadow-secondary flex flex-col items-center">
            
            {/* Grandmaster Sprite Frame */}
            <div className="w-40 h-40 bg-surface-container-lowest border-[3px] border-outline-variant p-2 retro-shadow-secondary flex items-center justify-center relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxYjFiMWQiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+')]">
              <img
                className="w-full h-full object-cover pixelated"
                src={ojiSanBase64}
                alt="Master Oji-San Sensei"
              />
              <div className="absolute bottom-[-1px] right-[-1px] bg-inverse-primary border-t-[3px] border-l-[3px] border-outline-variant px-2 py-0.5">
                <span className="font-label-sm text-[9px] text-parchment uppercase font-bold">
                  Sensei
                </span>
              </div>
            </div>

            {/* Instruction Speech Bubble */}
            <div className="bg-parchment border-[3px] border-outline-variant p-4 mt-6 rounded-lg retro-shadow-secondary text-on-tertiary-fixed-variant relative w-full">
              <h3 className="font-headline-md text-sm font-black text-inverse-primary uppercase mb-2 tracking-tight">
                "HEED MY WORDS!"
              </h3>
              <p className="font-body-md text-xs text-on-tertiary-fixed font-semibold leading-relaxed">
                Choose your AI engine, insert your API key, and hit save! Keep your credentials secret. Any slacking off, and my cane shall find your knuckles!
              </p>
            </div>
          </div>

          {/* Right Column: Settings Form */}
          <div className="lg:col-span-8 bg-surface border-[3px] border-outline-variant rounded-xl retro-shadow-container glow-crimson overflow-hidden">
            
            {/* Card Title Banner */}
            <div className="bg-surface-container-high border-b-[3px] border-outline-variant p-5 flex justify-between items-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMzOTM5M2IiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+')]">
              <span className="font-headline-md text-lg text-secondary-container tracking-tight uppercase leading-none font-bold">
                Dojo Configurations
              </span>
              <span className="text-xs bg-error-container text-parchment px-2 py-0.5 border-[2px] border-on-error-container uppercase font-bold">
                MV3 Stable
              </span>
            </div>

            <form onSubmit={handleSave} className="p-6 flex flex-col gap-6">
              
              {/* Provider Selection */}
              <div className="flex flex-col gap-2">
                <label className="font-label-md text-xs text-on-surface-variant uppercase font-bold flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-secondary-container" />
                  Active AI Engine
                </label>
                <div className="flex gap-4 mt-1">
                  <button
                    type="button"
                    onClick={() => setAiProvider('gemini')}
                    className={`flex-1 py-3 font-label-md text-sm border-[3px] uppercase font-black transition-all ${
                      aiProvider === 'gemini'
                        ? 'bg-tertiary-container text-background border-outline-variant retro-shadow-secondary translate-y-0.5'
                        : 'bg-surface-container border-outline-variant text-muted hover:text-on-surface hover:border-on-surface'
                    }`}
                  >
                    Google Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiProvider('groq')}
                    className={`flex-1 py-3 font-label-md text-sm border-[3px] uppercase font-black transition-all ${
                      aiProvider === 'groq'
                        ? 'bg-primary-container text-parchment border-on-primary-fixed retro-shadow-primary translate-y-0.5'
                        : 'bg-surface-container border-outline-variant text-muted hover:text-on-surface hover:border-on-surface'
                    }`}
                  >
                    Groq Cloud
                  </button>
                </div>
              </div>

              {/* Engine Specific Fields */}
              <div className="border-t-[3px] border-dashed border-outline-variant pt-6 flex flex-col gap-5">
                {aiProvider === 'gemini' ? (
                  <>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="gemini-key" className="font-label-md text-xs text-on-surface-variant uppercase font-bold flex items-center gap-2">
                        <Key className="w-4 h-4 text-tertiary-container" />
                        Gemini API Key
                      </label>
                      <input
                        type="password"
                        id="gemini-key"
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="Enter Google AI Studio Key (AIzaSy...)"
                        className="retro-input p-3 font-label-md text-sm text-on-background w-full"
                        required={aiProvider === 'gemini'}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="gemini-model-select" className="font-label-md text-xs text-on-surface-variant uppercase font-bold flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-tertiary-container" />
                        Gemini Model
                      </label>
                      <select
                        id="gemini-model-select"
                        value={geminiModel}
                        onChange={(e) => setGeminiModel(e.target.value)}
                        className="retro-input p-3 font-label-md text-sm text-on-background w-full bg-surface"
                      >
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Default)</option>
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="groq-key" className="font-label-md text-xs text-on-surface-variant uppercase font-bold flex items-center gap-2">
                        <Key className="w-4 h-4 text-primary-container" />
                        Groq API Key
                      </label>
                      <input
                        type="password"
                        id="groq-key"
                        value={groqApiKey}
                        onChange={(e) => setGroqApiKey(e.target.value)}
                        placeholder="Enter Groq Cloud API Key (gsk_...)"
                        className="retro-input p-3 font-label-md text-sm text-on-background w-full"
                        required={aiProvider === 'groq'}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="groq-model-select" className="font-label-md text-xs text-on-surface-variant uppercase font-bold flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-primary-container" />
                        Groq Model
                      </label>
                      <select
                        id="groq-model-select"
                        value={groqModel}
                        onChange={(e) => setGroqModel(e.target.value)}
                        className="retro-input p-3 font-label-md text-sm text-on-background w-full bg-surface"
                      >
                        <option value="openai/gpt-oss-20b">GPT-OSS 20B (Recommended)</option>
                        <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
                        <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="mt-4 px-6 py-4 bg-inverse-primary text-parchment font-label-md text-sm md:text-base uppercase font-black border-[3px] border-on-primary-fixed retro-shadow-primary hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(187,21,44,1)] active:translate-y-[4px] active:shadow-none transition-all duration-75 flex items-center justify-center gap-2 w-full cursor-pointer disabled:opacity-50"
              >
                <Save className="w-5 h-5 shrink-0" />
                {isSaving ? 'Saving Configurations...' : 'Save Dojo Settings'}
              </button>

              {/* Extra Utility Tools */}
              <div className="border-t-[3px] border-dashed border-outline-variant pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={handleResetStats}
                  className="flex-1 py-3 px-4 bg-surface-container border-[3px] border-outline-variant text-muted font-label-md text-xs uppercase font-black text-center hover:text-on-surface hover:border-on-surface active:translate-y-[1px] transition-all flex items-center justify-center gap-2 w-full cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  Reset Dojo Stats
                </button>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="flex-1 py-3 px-4 bg-surface-container border-[3px] border-outline-variant text-muted font-label-md text-xs uppercase font-black text-center hover:text-on-surface hover:border-on-surface active:translate-y-[1px] transition-all flex items-center justify-center gap-2 w-full cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  Clear Evaluation Cache
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* Dojo Gatekeepers & Lists (Whitelist & Blocklist Manager) */}
        <div className="mt-12 bg-surface border-[3px] border-outline-variant rounded-xl retro-shadow-container glow-crimson overflow-hidden">
          
          <div className="bg-surface-container-high border-b-[3px] border-outline-variant p-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMzOTM5M2IiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+')]">
            <span className="font-headline-md text-lg text-secondary-container tracking-tight uppercase leading-none font-bold">
              Dojo Gatekeepers & Lists
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Whitelisted Sites Manager */}
            <div className="flex flex-col gap-4 border-b-2 md:border-b-0 md:border-r-2 border-outline-variant pb-6 md:pb-0 md:pr-8">
              <div>
                <h3 className="font-headline-md text-md text-secondary-container font-black uppercase mb-1">
                  Whitelisted Domains (Bypass Gate)
                </h3>
                <p className="text-muted text-xs">
                  Oji-San will NOT monitor these sites. AI checking is bypassed.
                </p>
              </div>

              {/* Add Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. stackoverflow.com"
                  value={newWhitelistDomain}
                  onChange={(e) => setNewWhitelistDomain(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWhitelistDomain()}
                  className="retro-input p-2 font-label-md text-xs text-on-background flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddWhitelistDomain}
                  className="px-4 py-2 bg-tertiary-container text-background font-label-md text-xs uppercase font-black border-[3px] border-outline-variant retro-shadow-secondary hover:translate-y-[1px] active:translate-y-[2px] transition-all cursor-pointer shrink-0"
                >
                  + Add
                </button>
              </div>

              {/* List */}
              <div className="max-h-60 overflow-y-auto flex flex-col gap-2 mt-2 pr-1">
                {whitelist.length === 0 ? (
                  <p className="text-muted text-xs italic">No whitelisted sites. The Dojo gates are tight.</p>
                ) : (
                  whitelist.map(domain => (
                    <div key={domain} className="flex justify-between items-center bg-surface-container p-2.5 border-2 border-outline-variant retro-shadow-secondary">
                      <span className="font-mono text-xs truncate mr-2 text-on-background">{domain}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWhitelistDomain(domain)}
                        className="p-1.5 text-error hover:bg-error-container hover:text-parchment border-2 border-transparent hover:border-outline-variant transition-all cursor-pointer shrink-0"
                        title="Remove from Whitelist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI-Blocked Sites (Cache List) */}
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-headline-md text-md text-inverse-primary font-black uppercase mb-1">
                  AI-Blocked Sites (Dojo Prison)
                </h3>
                <p className="text-muted text-xs">
                  Sites evaluated as distracting and currently blocked. Remove to force re-evaluation.
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto flex flex-col gap-3 pr-1">
                
                {/* Blocked Domains */}
                <div>
                  <h4 className="font-label-md text-xs uppercase font-bold text-on-surface-variant mb-2">Blocked Domains</h4>
                  {Object.keys(domainCache).filter(k => !domainCache[k].isProductive).length === 0 ? (
                    <p className="text-muted text-xs italic">No domains blocked. Discipline is high!</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {Object.keys(domainCache)
                        .filter(k => !domainCache[k].isProductive)
                        .map(domain => (
                          <div key={domain} className="flex justify-between items-center bg-surface-container p-2.5 border-2 border-outline-variant retro-shadow-secondary">
                            <div className="flex flex-col truncate mr-2">
                              <span className="font-mono text-xs text-on-background truncate">{domain}</span>
                              <span className="text-[10px] text-muted italic truncate">"{domainCache[domain].scoldingMessage}"</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveBlockedDomain(domain)}
                              className="p-1.5 text-error hover:bg-error-container hover:text-parchment border-2 border-transparent hover:border-outline-variant transition-all cursor-pointer shrink-0"
                              title="Unblock Domain"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Blocked URLs */}
                <div className="border-t border-outline-variant pt-3 mt-1">
                  <h4 className="font-label-md text-xs uppercase font-bold text-on-surface-variant mb-2">Blocked Specific Pages</h4>
                  {Object.keys(urlCache).filter(k => !urlCache[k].isProductive).length === 0 ? (
                    <p className="text-muted text-xs italic">No specific URLs blocked.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {Object.keys(urlCache)
                        .filter(k => !urlCache[k].isProductive)
                        .map(url => (
                          <div key={url} className="flex justify-between items-center bg-surface-container p-2.5 border-2 border-outline-variant retro-shadow-secondary">
                            <div className="flex flex-col truncate mr-2">
                              <span className="font-mono text-[10px] text-on-background truncate" title={url}>{url}</span>
                              <span className="text-[9px] text-muted italic truncate">"{urlCache[url].scoldingMessage}"</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveBlockedUrl(url)}
                              className="p-1.5 text-error hover:bg-error-container hover:text-parchment border-2 border-transparent hover:border-outline-variant transition-all cursor-pointer shrink-0"
                              title="Unblock URL"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
