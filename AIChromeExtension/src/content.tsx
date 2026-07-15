import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, Gavel, History, Hand } from 'lucide-react';
import { ojiSanBase64 } from './assets/oji-san-base64';
import styleText from './index.css?inline';

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

const InterventionOverlay: React.FC<InterventionOverlayProps> = ({ message, onClose }) => {
  const [scoldMessage, setScoldMessage] = useState(message);

  // Update message if a new one is sent while overlay is open
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

// Injection function
const injectOverlay = (message: string) => {
  // Check if already injected
  let rootContainer = document.getElementById('oji-san-intervention-root');
  if (rootContainer) {
    return;
  }

  // Create overlay host container
  rootContainer = document.createElement('div');
  rootContainer.id = 'oji-san-intervention-root';
  rootContainer.style.position = 'fixed';
  rootContainer.style.top = '0';
  rootContainer.style.left = '0';
  rootContainer.style.width = '100vw';
  rootContainer.style.height = '100vh';
  rootContainer.style.zIndex = '99999999';
  rootContainer.style.pointerEvents = 'none';
  document.body.appendChild(rootContainer);

  // Attach Shadow DOM for style isolation
  const shadowRoot = rootContainer.attachShadow({ mode: 'open' });

  // Load Bricolage & Outfit fonts inside the Shadow DOM (if browser CSP allows it)
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Outfit:wght@400&display=swap';
  shadowRoot.appendChild(fontLink);

  // Inject Tailwind CSS compiles inline
  const style = document.createElement('style');
  style.id = 'oji-san-tailwind-styles';
  style.textContent = `
    ${styleText}
    
    /* Reset styles to guard against page overrides */
    .oji-san-wrapper, .oji-san-wrapper * {
      box-sizing: border-box !important;
      margin: 0;
      padding: 0;
      font-family: 'Outfit', sans-serif;
    }
    .oji-san-wrapper button {
      cursor: pointer;
      outline: none;
    }
  `;
  shadowRoot.appendChild(style);

  // Create React mount target inside Shadow DOM
  const appContainer = document.createElement('div');
  appContainer.className = 'oji-san-wrapper w-full h-full';
  appContainer.style.pointerEvents = 'auto'; // Re-enable clicks inside the card
  shadowRoot.appendChild(appContainer);

  const root = createRoot(appContainer);
  const handleClose = () => {
    if (rootContainer) {
      root.unmount();
      rootContainer.remove();
    }
  };

  root.render(<InterventionOverlay message={message} onClose={handleClose} />);
};

// Message listener from background worker
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'intervene') {
      injectOverlay(message.scoldingMessage);
    }
  });

  // Run initial handshake check to see if page should be blocked instantly from cache
  sendMessageSafe({ action: 'checkInterventionStatus' }, (response) => {
    if (response && response.shouldIntervene) {
      console.log('[Oji-San] Handshake: Page is unproductive. Triggering scolding overlay.');
      injectOverlay(response.scoldingMessage);
    }
  });
}

// YouTube Shield DOM Filter Logic (Unhook-style AI-free layout hiding)
if (window.location.hostname.includes('youtube.com')) {
  chrome.storage.local.get(['ytShield', 'focusMode', 'focusGoal'], (data) => {
    const ytShield = !!data.ytShield;
    const focusMode = !!data.focusMode;
    const focusGoal = String(data.focusGoal || '');

    if (focusMode && ytShield && focusGoal) {
      console.log(`[Oji-San] YouTube Shield Active (Unhook Mode)! screening sections for goal: "${focusGoal}"`);

      // Inject custom styling in the main document to hide recommendations, home feeds, and comments permanently
      const styleId = 'oji-san-unhook-styles';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = `
          /* Hide YouTube home feed grid elements */
          ytd-browse[page-subtype="home"] ytd-rich-grid-renderer,
          ytd-browse[page-subtype="home"] #contents,
          ytd-browse[page-subtype="home"] #primary {
            display: none !important;
          }

          /* Hide specific watch page elements (sidebar recommendations & comments section) */
          ytd-watch-flexy #secondary,
          ytd-watch-flexy #related,
          #secondary.ytd-watch-flexy,
          ytd-watch-flexy #comments,
          #comments.ytd-watch-flexy {
            display: none !important;
          }
        `;
        document.head.appendChild(styleElement);
      }

      // Check and handle feed banner rendering
      const applyShield = () => {
        const path = window.location.pathname;

        // Homepage: Inject centered Dojo search banner
        if (path === '/' || path === '') {
          // If banner already exists, don't duplicate
          if (!document.getElementById('oji-san-home-banner')) {
            const banner = document.createElement('div');
            banner.id = 'oji-san-home-banner';
            banner.style.cssText = `
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 48px 32px;
              text-align: center;
              font-family: 'Outfit', sans-serif;
              background-color: #1e1e24;
              border: 3px solid #5b403f;
              border-radius: 12px;
              box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
              max-w-xl;
              margin: 120px auto;
              box-sizing: border-box;
            `;
            banner.innerHTML = `
              <div style="font-size: 48px; margin-bottom: 16px;">⚔️</div>
              <h1 style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 24px; font-weight: 800; color: #fbb400; margin-bottom: 8px; text-transform: uppercase; letter-spacing: -0.01em;">Dojo Focus Mode Active</h1>
              <p style="font-size: 14px; color: #e5e1e4; line-height: 1.5; margin-bottom: 16px;">
                The YouTube home feed, recommendations, and comments are locked by Oji-San.<br>
                Use the search bar above to look for contents related to:<br>
                <strong style="color: #ffb3b1; font-size: 16px;">"${focusGoal}"</strong>
              </p>
              <div style="font-size: 12px; color: #8d99ae; font-style: italic;">"Seek knowledge only, do not wander the gardens of distraction."</div>
            `;
            
            // Append banner to ytd-browse wrapper
            const browseContainer = document.querySelector('ytd-browse[page-subtype="home"]');
            if (browseContainer) {
              browseContainer.appendChild(banner);
            }
          }
        } else {
          // If navigated away from home, remove banner
          const banner = document.getElementById('oji-san-home-banner');
          if (banner) banner.remove();
        }
      };

      // Run immediately
      applyShield();

      // Listen to YouTube's SPA transitions to re-apply the filter
      document.addEventListener('yt-navigate-finish', applyShield);
    }
  });
}
