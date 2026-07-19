import React, { useState, useEffect } from 'react';
import { AlertTriangle, History, Hand } from 'lucide-react';
import { angryBase64, thinkingBase64, proudBase64, shockedBase64 } from '../../assets/oji-san-states';

interface InterventionOverlayProps {
  message: string;
  onClose: () => void;
}

const sendMessageSafe = (message: any, callback?: (response: any) => void) => {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage(message, (response) => {
        const lastError = chrome.runtime.lastError;
        if (lastError) {
          console.warn('[Oji-San] Communication error:', lastError.message);
          alert('Oji-San Dojo has been updated! Please refresh this page to continue.');
          return;
        }
        if (callback) callback(response);
      });
    } else {
      throw new Error('Extension context invalidated');
    }
  } catch (err) {
    console.error('[Oji-San] Communication error:', err);
    alert('Oji-San Dojo has been updated! Please refresh this page to continue.');
  }
};

export const InterventionOverlay: React.FC<InterventionOverlayProps> = ({ message, onClose }) => {
  const [scoldMessage, setScoldMessage] = useState(message);
  const [imageState, setImageState] = useState(angryBase64);
  const [mode, setMode] = useState<'scolding' | 'negotiating'>('scolding');
  const [excuse, setExcuse] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    setScoldMessage(message);
  }, [message]);

  const handleSubmitExcuse = () => {
    if (!excuse.trim() || isEvaluating) return;
    setIsEvaluating(true);
    setImageState(thinkingBase64);
    
    sendMessageSafe({ action: 'submitExcuse', excuse }, (response) => {
      setIsEvaluating(false);
      if (response && response.accepted) {
        onClose();
      } else if (response && !response.accepted) {
        setScoldMessage(response.roastMessage || "Weak excuse. Denied!");
        setImageState(shockedBase64);
        setMode('scolding');
        setExcuse('');
        
        // Return to angry state after 3 seconds
        setTimeout(() => {
          setImageState(angryBase64);
        }, 3000);
      } else {
        setScoldMessage("Your excuse was lost in the wind. Try again.");
        setImageState(angryBase64);
        setMode('scolding');
      }
    });
  };

  const handleCloseTab = () => {
    sendMessageSafe({ action: 'closeTab' });
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#131315]/80 backdrop-blur-md z-[9999] flex items-center justify-center p-8 select-none overflow-hidden text-[#e5e1e4] scanlines">
      {/* Center Intervention Card */}
      <div className="bg-[#1E1E24] w-full max-w-3xl rounded-lg glow-crimson flex flex-col relative overflow-hidden animate-[pulse_3s_ease-in-out_infinite] z-50 shadow-2xl">
        
        {/* Wood Texture / Scroll Banner Header */}
        <div className="bg-[#0e0e10] border-b-[3px] border-[#bb152c] p-6 flex justify-between items-center px-8 relative" style={{ minHeight: '80px' }}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMzOTM5M2IiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] opacity-10"></div>
          <div className="flex items-center gap-4 relative z-10 w-full justify-center">
            <AlertTriangle className="text-[#fbb400] w-10 h-10 shrink-0" />
            <h1 className="text-4xl md:text-5xl text-[#fbb400] tracking-tighter uppercase drop-shadow-[0_0_8px_rgba(251,180,0,0.8)] m-0 text-center" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
              Dojo Code Chamber
            </h1>
            <AlertTriangle className="text-[#fbb400] w-10 h-10 shrink-0" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row items-center md:items-start relative bg-[#131315]" style={{ padding: '40px', gap: '32px' }}>
          {/* Oji-San Sprite Frame */}
          <div className="shrink-0 hologram-frame p-2 flex items-center justify-center relative overflow-hidden rounded-md" style={{ width: '220px', height: '220px' }}>
            <img 
              alt="Master Oji-San" 
              className="w-full h-full object-cover pixelated relative z-20" 
              src={imageState} 
            />
          </div>

          {/* Speech Bubble Area */}
          <div className="flex-1 w-full flex items-center">
            <div className="bg-[#1b1b1d] border-2 border-[#5b403f] relative rounded-md shadow-[0_0_15px_rgba(0,0,0,0.5)] text-[#e5e1e4] flex-1" style={{ padding: '32px' }}>
              <div className="bubble-tail hidden md:block"></div>
              <h2 className="text-2xl font-black text-[#bb152c] uppercase mb-4 tracking-widest drop-shadow-[0_0_5px_rgba(187,21,44,0.8)] leading-none mt-0" style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}>
                "FOOLISH DISCIPLE!"
              </h2>
              <p className="text-lg text-[#e5e1e4] font-medium leading-relaxed m-0" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {scoldMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="bg-[#201f21] border-t-2 border-[#bb152c] flex flex-col md:flex-row justify-center items-center relative min-h-[100px]" style={{ padding: '24px', gap: '24px' }}>
          
          {mode === 'scolding' ? (
            <>
              <button 
                onMouseEnter={() => setImageState(thinkingBase64)}
                onMouseLeave={() => setImageState(angryBase64)}
                onClick={() => setMode('negotiating')}
                className="bg-[#353437] text-[#e5e1e4] text-sm uppercase border-2 border-[#5b403f] hover:border-[#fbb400] hover:text-[#fbb400] transition-all duration-150 flex items-center justify-center tracking-widest hover:shadow-[0_0_10px_rgba(251,180,0,0.3)] rounded-md"
                style={{ fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace', padding: '16px 24px', gap: '8px' }}
              >
                <History className="w-5 h-5 shrink-0" />
                Plead Case (Trial)
              </button>
              
              <button 
                onMouseEnter={() => setImageState(proudBase64)}
                onMouseLeave={() => setImageState(angryBase64)}
                onClick={handleCloseTab}
                className="bg-[#bb152c] text-[#F1FAEE] text-sm uppercase font-bold border-2 border-[#bb152c] hover:bg-[#410007] hover:border-[#bb152c] transition-all duration-150 flex items-center justify-center tracking-widest shadow-[0_0_15px_rgba(187,21,44,0.6)] hover:shadow-[0_0_25px_rgba(187,21,44,0.8)] rounded-md"
                style={{ fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace', padding: '16px 24px', gap: '8px' }}
              >
                <Hand className="w-5 h-5 shrink-0" />
                Forgive me (Close Tab)
              </button>
            </>
          ) : (
            <div className="flex w-full flex-col md:flex-row gap-4 items-center">
              <input 
                type="text"
                value={excuse}
                onChange={(e) => setExcuse(e.target.value)}
                disabled={isEvaluating}
                placeholder="Convince me you need this..."
                className="flex-1 bg-[#131315] border-2 border-[#5b403f] text-[#e5e1e4] rounded-md focus:outline-none focus:border-[#fbb400] transition-colors"
                style={{ padding: '16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmitExcuse();
                }}
              />
              <div className="flex gap-4 shrink-0">
                <button 
                  onClick={() => setMode('scolding')}
                  disabled={isEvaluating}
                  className="bg-[#353437] text-[#e5e1e4] text-sm uppercase border-2 border-[#5b403f] hover:border-[#e5e1e4] transition-all duration-150 flex items-center justify-center rounded-md disabled:opacity-50"
                  style={{ fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace', padding: '16px 24px' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitExcuse}
                  disabled={isEvaluating || !excuse.trim()}
                  className="bg-[#fbb400] text-[#131315] font-bold text-sm uppercase border-2 border-[#fbb400] hover:bg-[#ffdea9] hover:border-[#ffdea9] transition-all duration-150 flex items-center justify-center rounded-md shadow-[0_0_15px_rgba(251,180,0,0.4)] disabled:opacity-50"
                  style={{ fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace', padding: '16px 24px' }}
                >
                  {isEvaluating ? 'Evaluating...' : 'Submit'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
