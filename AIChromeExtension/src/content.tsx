
import { createRoot } from 'react-dom/client';
import { InterventionOverlay } from './content/components/InterventionOverlay';
import { createShadowContainer } from './content/shadow';
import { applyYoutubeShield } from './content/youtube';
import styleText from './index.css?inline';

// Injection helper function
const injectOverlay = (message: string) => {
  // Check if already injected
  let rootContainer = document.getElementById('oji-san-intervention-root');
  if (rootContainer) {
    return;
  }

  const shadow = createShadowContainer(styleText);
  const root = createRoot(shadow.appContainer);

  const handleClose = () => {
    root.unmount();
    shadow.cleanup();
  };

  root.render(<InterventionOverlay message={message} onClose={handleClose} />);
};

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

// Check and apply YouTube Shield
chrome.storage.local.get(['ytShield', 'focusMode', 'focusGoal'], (data) => {
  const ytShield = !!data.ytShield;
  const focusMode = !!data.focusMode;
  const focusGoal = String(data.focusGoal || '');

  if (focusMode && ytShield && focusGoal) {
    applyYoutubeShield(focusGoal);
  }
});
