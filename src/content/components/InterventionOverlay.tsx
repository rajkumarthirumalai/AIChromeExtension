import React, { useState, useEffect } from 'react';
import { AlertTriangle, Gavel, History, Hand } from 'lucide-react';
import { ojiSanBase64 } from '../../assets/oji-san-base64';

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

  useEffect(() => {
    setScoldMessage(message);
  }, [message]);

  const handleBypass = () => {
    sendMessageSafe({ action: 'bypassUrl' }, (response) => {
      if (response && response.success) {
        console.log('[Oji-San] Bypass approved.');
        onClose();
      }
    });
  };

  const handleCloseTab = () => {
    sendMessageSafe({ action: 'closeTab' });
  };

  return (
    <div className="w-full h-full bg-background/80 backdrop-blur-md flex items-center justify-center p-margin-mobile md:p-margin-desktop select-none overflow-hidden text-on-background">
      {/* Center Intervention Card */}
      <div className="bg-surface border-[3px] border-outline-variant w-full max-w-2xl rounded-xl retro-shadow-container glow-crimson flex flex-col relative overflow-hidden animate-[pulse_3s_ease-in-out_infinite]">
        {/* Wood Texture / Scroll Banner Header */}
        <div className="bg-surface-container-high border-b-[3px] border-outline-variant p-6 flex justify-between items-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMzOTM5M2IiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+')]">
          <div className="flex items-center gap-4">
            <AlertTriangle className="text-inverse-primary w-9 h-9 shrink-0" />
            <h1 className="font-headline-xl text-2xl md:text-[32px] text-secondary-container tracking-tighter uppercase leading-none">
              Dojo Code Chamber
            </h1>
          </div>
          <Gavel className="text-outline-variant w-9 h-9 shrink-0" />
        </div>

        {/* Content Area */}
        <div className="p-gutter flex flex-col md:flex-row gap-gutter items-center md:items-start relative">
          {/* Oji-San Sprite Frame */}
          <div className="shrink-0 w-48 h-48 bg-surface-container-lowest border-[3px] border-outline-variant p-2 retro-shadow-secondary flex items-center justify-center relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxYjFiMWQiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+')]">
            <img
              className="w-full h-full object-cover pixelated"
              src={ojiSanBase64}
              alt="Master Oji-San scolding"
            />
            {/* Rank Badge */}
            <div className="absolute bottom-[-1px] right-[-1px] bg-inverse-primary border-t-[3px] border-l-[3px] border-outline-variant px-2 py-1">
              <span className="font-label-sm text-xs text-parchment uppercase">
                Grandmaster
              </span>
            </div>
          </div>

          {/* Speech Bubble Area */}
          <div className="flex-1 w-full pt-4 md:pt-0">
            <div className="bg-parchment border-[3px] border-outline-variant p-6 relative rounded-lg retro-shadow-secondary text-on-tertiary-fixed-variant">
              <div className="bubble-tail hidden md:block"></div>
              <h2 className="font-headline-md text-lg md:text-[24px] font-black text-inverse-primary uppercase mb-4 tracking-tight leading-none">
                "FOOLISH DISCIPLE!"
              </h2>
              <p className="font-body-lg text-sm md:text-[18px] text-on-tertiary-fixed font-bold leading-relaxed">
                {scoldMessage}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="bg-surface-container border-t-[3px] border-outline-variant p-gutter flex flex-col md:flex-row justify-end gap-4 shrink-0">
          <button
            onClick={handleBypass}
            className="px-6 py-4 bg-surface-variant text-on-surface-variant font-label-md text-xs md:text-sm uppercase border-[3px] border-outline-variant retro-shadow-secondary hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(91,64,63,1)] active:translate-y-[4px] active:shadow-none transition-all duration-75 flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <History className="w-5 h-5 shrink-0" />
            I am actually working (Request Bypass)
          </button>
          <button
            onClick={handleCloseTab}
            className="px-6 py-4 bg-inverse-primary text-parchment font-label-md text-xs md:text-sm uppercase font-bold border-[3px] border-on-primary-fixed retro-shadow-primary hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(187,21,44,1)] active:translate-y-[4px] active:shadow-none transition-all duration-75 flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <Hand className="w-5 h-5 shrink-0" />
            Forgive me, Oji-San (Close Tab)
          </button>
        </div>
      </div>
    </div>
  );
};
