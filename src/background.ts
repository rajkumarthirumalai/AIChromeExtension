// Oji-San AI Focus Extension - Background Service Worker
import { systemPrompt, multiPurposeDomains } from './background/config';
import { getProvider } from './background/providers';
import { getHostname, getDomain } from './background/cache';

// Set to track active API evaluations in-flight and prevent race condition duplicate calls
const inFlightEvaluations = new Set<string>();

// Reusable tab evaluation logic with persistent URL/Domain caching and race-condition prevention
async function evaluateTab(tabId: number, tab: chrome.tabs.Tab) {
  const url = tab.url;
  if (!url) return;

  // Ignore internal chrome/extension pages
  if (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:')
  ) {
    return;
  }

  // Prevent duplicate evaluations for the same URL in-flight concurrently
  if (inFlightEvaluations.has(url)) {
    console.log(`[Oji-San] Evaluation already in-flight for URL: ${url}. Skipping duplicate check.`);
    return;
  }

  // Retrieve extension state, evaluation cache, and domain cache from storage
  chrome.storage.local.get(
    [
      'focusMode', 
      'focusGoal', 
      'geminiApiKey', 
      'geminiModel', 
      'groqApiKey', 
      'groqModel', 
      'aiProvider', 
      'pagesEvaluated', 
      'distractionsSlashed', 
      'bypassUrls', 
      'evaluationCache',
      'domainCache'
    ],
    async (data) => {
      const focusMode = !!data.focusMode;
      const focusGoal = String(data.focusGoal || '');
      const geminiApiKey = String(data.geminiApiKey || '');
      const geminiModel = String(data.geminiModel || 'gemini-2.5-flash');
      const groqApiKey = String(data.groqApiKey || '');
      const groqModel = String(data.groqModel || 'openai/gpt-oss-20b');
      const aiProvider = String(data.aiProvider || 'gemini');
      const pagesEvaluated = Number(data.pagesEvaluated || 0);
      const distractionsSlashed = Number(data.distractionsSlashed || 0);
      const bypassUrls = (data.bypassUrls as string[]) || [];
      
      const urlCache = (data.evaluationCache as Record<string, { isProductive: boolean; scoldingMessage: string }>) || {};
      const domainCache = (data.domainCache as Record<string, { isProductive: boolean; scoldingMessage: string }>) || {};

      // If Focus Mode is OFF, do nothing
      if (!focusMode) return;

      // If no Focus Goal is defined, do nothing
      if (!focusGoal || focusGoal.trim() === '') return;

      const hostname = getHostname(url);
      const domain = getDomain(url);

      // Check if URL hostname is whitelisted/bypassed
      const whitelisted = Array.isArray(bypassUrls) ? bypassUrls : [];
      if (whitelisted.includes(hostname) || whitelisted.includes(domain) || domain === 'youtube.com' || domain === 'youtu.be') {
        console.log(`[Oji-San] Bypassing evaluation for whitelisted site: ${hostname}`);
        return;
      }

      // 1. Check URL Cache first (for multi-purpose domains)
      if (urlCache[url]) {
        const cached = urlCache[url];
        console.log(`[Oji-San] Using cached URL evaluation for URL: ${url} | productive: ${cached.isProductive}`);
        applyCachedResult(tabId, cached, pagesEvaluated, distractionsSlashed);
        return;
      }

      // 2. Check Domain Cache (for non-multi-purpose domains)
      if (!multiPurposeDomains.includes(domain) && domainCache[domain]) {
        const cached = domainCache[domain];
        console.log(`[Oji-San] Using cached DOMAIN evaluation for Domain: ${domain} (URL: ${url}) | productive: ${cached.isProductive}`);
        applyCachedResult(tabId, cached, pagesEvaluated, distractionsSlashed);
        return;
      }

      // Verify active key is configured
      const activeKey = aiProvider === 'groq' ? groqApiKey : geminiApiKey;
      const activeModel = aiProvider === 'groq' ? groqModel : geminiModel;
      
      if (!activeKey) {
        console.warn(`[Oji-San] Focus mode is active, but ${aiProvider.toUpperCase()} API key is missing. Please configure it in the Dojo Dashboard settings.`);
        return;
      }

      // Special handling: If YouTube Shield is active, we bypass page-level blocking ONLY for the homepage or search pages, 
      // allowing them to search, but we DO NOT bypass page-level blocking if they try to watch a specific video (/watch)
      chrome.storage.local.get(['ytShield'], async (ytData) => {
        const ytShield = !!ytData.ytShield;
        
        const isYt = hostname === 'youtube.com' || hostname === 'www.youtube.com';
        const isYtHomeOrSearch = isYt && (
          url.endsWith('youtube.com/') || 
          url.includes('/results') || 
          url.includes('/feed') || 
          url.includes('/shared')
        );

        if (ytShield && isYtHomeOrSearch) {
          console.log('[Oji-San] YouTube Shield is active on home/search. Skipping page block; recommendations feed is blocked.');
          return;
        }

        // Lock URL evaluation to prevent concurrent duplicate requests
        inFlightEvaluations.add(url);
        console.log(`[Oji-San] Evaluating page via ${aiProvider.toUpperCase()} | Goal: "${focusGoal}" | URL: ${url}`);

        try {
          // Resolve provider through Factory interface
          const provider = getProvider(aiProvider, {
            apiKey: activeKey,
            model: activeModel,
            systemPrompt: systemPrompt
          });

          const evaluation = await provider.evaluate(focusGoal, tab.title || '', url);

          // Increment evaluated pages counter
          const nextEvaluated = (Number(pagesEvaluated) || 0) + 1;
          
          // Save evaluation result to cache
          const evaluationData = {
            isProductive: evaluation.isProductive,
            scoldingMessage: evaluation.scoldingMessage || ''
          };

          if (multiPurposeDomains.includes(domain)) {
            urlCache[url] = evaluationData;
            chrome.storage.local.set({ 
              pagesEvaluated: nextEvaluated,
              evaluationCache: urlCache
            });
          } else {
            domainCache[domain] = evaluationData;
            chrome.storage.local.set({ 
              pagesEvaluated: nextEvaluated,
              domainCache: domainCache
            });
          }

          console.log('[Oji-San] Evaluation result:', evaluation);

          if (!evaluation.isProductive) {
            // Increment distractions slashed counter
            const nextSlashed = (Number(distractionsSlashed) || 0) + 1;
            chrome.storage.local.set({ distractionsSlashed: nextSlashed });

            // Send message to Content Script in the active tab to trigger intervention
            chrome.tabs.sendMessage(tabId, {
              action: 'intervene',
              scoldingMessage: evaluation.scoldingMessage,
            }, () => {
              // Suppress "Receiving end does not exist" console warning if page is still building DOM
              const lastError = chrome.runtime.lastError;
              if (lastError) {
                console.log('[Oji-San] Tab connection pending (expected during load phase).');
              }
            });
          }
        } catch (err) {
          console.error('[Oji-San] Evaluation failed:', err);
        } finally {
          // Release in-flight lock
          inFlightEvaluations.delete(url);
        }
      });
    }
  );
}

// Helper to apply cached evaluation results immediately
function applyCachedResult(
  tabId: number, 
  cached: { isProductive: boolean; scoldingMessage: string },
  pagesEvaluated: number,
  distractionsSlashed: number
) {
  const nextEvaluated = (Number(pagesEvaluated) || 0) + 1;
  chrome.storage.local.set({ pagesEvaluated: nextEvaluated });

  if (!cached.isProductive) {
    const nextSlashed = (Number(distractionsSlashed) || 0) + 1;
    chrome.storage.local.set({ distractionsSlashed: nextSlashed });

    // Send warning to content script
    chrome.tabs.sendMessage(tabId, {
      action: 'intervene',
      scoldingMessage: cached.scoldingMessage,
    }, () => {
      // Suppress "Receiving end does not exist" console warning if page is still building DOM
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        console.log('[Oji-San] Tab connection pending (expected during load phase).');
      }
    });
  }
}

// 1. Listener for Tab Updates (navigation/reload/history changes)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Capture URL shifts for single-page applications
  if ((changeInfo.status === 'complete' || changeInfo.url) && tab.url) {
    evaluateTab(tabId, tab);
  }
});

// 2. Listener for Tab Activation (switching tabs)
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url && tab.status === 'complete') {
      evaluateTab(activeInfo.tabId, tab);
    }
  });
});

// 3. Listener for Runtime Messages from Content Script (Handshake and buttons)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'closeTab' && sender.tab?.id) {
    chrome.tabs.remove(sender.tab.id, () => {
      console.log(`[Oji-San] Closed tab ${sender.tab?.id} on disciple's request.`);
    });
    sendResponse({ success: true });
  } else if (message.action === 'bypassUrl' && sender.tab?.url) {
    const url = sender.tab.url;
    const hostname = getHostname(url);
    const domain = getDomain(url);
    if (hostname) {
      chrome.storage.local.get(['bypassUrls', 'evaluationCache', 'domainCache'], (data) => {
        const whitelisted = Array.isArray(data.bypassUrls) ? data.bypassUrls : [];
        if (!whitelisted.includes(hostname)) {
          whitelisted.push(hostname);
        }
        if (domain && !whitelisted.includes(domain)) {
          whitelisted.push(domain);
        }

        const urlCache: Record<string, any> = data.evaluationCache || {};
        const domCache: Record<string, any> = data.domainCache || {};
        
        let cachesChanged = false;
        
        if (urlCache[url]) {
          delete urlCache[url];
          cachesChanged = true;
        }
        
        if (domCache[domain]) {
          delete domCache[domain];
          cachesChanged = true;
        }
        
        const updates: any = { bypassUrls: whitelisted };
        if (cachesChanged) {
          updates.evaluationCache = urlCache;
          updates.domainCache = domCache;
        }

        chrome.storage.local.set(updates, () => {
          console.log(`[Oji-San] Whitelisted ${hostname} and cleared from caches.`);
        });
      });
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Invalid URL' });
    }
  } else if (message.action === 'submitExcuse' && sender.tab?.url && sender.tab?.title) {
    const url = sender.tab.url;
    const title = sender.tab.title;
    const excuse = message.excuse;

    chrome.storage.local.get(
      ['focusGoal', 'geminiApiKey', 'geminiModel', 'groqApiKey', 'groqModel', 'aiProvider'],
      async (data) => {
        const focusGoal = String(data.focusGoal || '');
        const geminiApiKey = String(data.geminiApiKey || '');
        const geminiModel = String(data.geminiModel || 'gemini-2.5-flash');
        const groqApiKey = String(data.groqApiKey || '');
        const groqModel = String(data.groqModel || 'openai/gpt-oss-20b');
        const aiProvider = String(data.aiProvider || 'gemini');

        const activeKey = aiProvider === 'groq' ? groqApiKey : geminiApiKey;
        const activeModel = aiProvider === 'groq' ? groqModel : geminiModel;

        if (!activeKey) {
          sendResponse({ success: false, error: 'API Key missing' });
          return;
        }

        try {
          const provider = getProvider(aiProvider, {
            apiKey: activeKey,
            model: activeModel,
            systemPrompt: systemPrompt
          });

          const result = await provider.evaluateExcuse(focusGoal, title, url, excuse);

          if (result.excuseAccepted) {
            const hostname = getHostname(url);
            const domain = getDomain(url);
            if (hostname) {
              chrome.storage.local.get(['bypassUrls'], (bwData) => {
                const whitelisted = Array.isArray(bwData.bypassUrls) ? bwData.bypassUrls : [];
                if (!whitelisted.includes(hostname)) whitelisted.push(hostname);
                if (domain && !whitelisted.includes(domain)) whitelisted.push(domain);
                chrome.storage.local.set({ bypassUrls: whitelisted });
              });
            }
          }

          sendResponse({ success: true, accepted: result.excuseAccepted, roastMessage: result.roastMessage });
        } catch (err) {
          console.error('[Oji-San] Excuse evaluation failed:', err);
          sendResponse({ success: false, error: 'Evaluation failed' });
        }
      }
    );
    return true;
  } else if (message.action === 'openOptions') {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
    sendResponse({ success: true });
  } else if (message.action === 'checkInterventionStatus' && sender.tab?.id && sender.tab?.url) {
    const url = sender.tab.url;
    const hostname = getHostname(url);
    const domain = getDomain(url);

    chrome.storage.local.get(['focusMode', 'focusGoal', 'evaluationCache', 'domainCache', 'bypassUrls'], (data) => {
      const focusMode = !!data.focusMode;
      const focusGoal = String(data.focusGoal || '');
      const urlCache = (data.evaluationCache as Record<string, { isProductive: boolean; scoldingMessage: string }>) || {};
      const domainCache = (data.domainCache as Record<string, { isProductive: boolean; scoldingMessage: string }>) || {};
      const bypassUrls = (data.bypassUrls as string[]) || [];

      if (!focusMode || !focusGoal) {
        sendResponse({ shouldIntervene: false });
        return;
      }

      // Check whitelist
      const whitelisted = Array.isArray(bypassUrls) ? bypassUrls : [];
      if (whitelisted.includes(hostname) || whitelisted.includes(domain)) {
        sendResponse({ shouldIntervene: false });
        return;
      }

      // Check URL Cache
      if (urlCache[url]) {
        const cached = urlCache[url];
        sendResponse({ shouldIntervene: !cached.isProductive, scoldingMessage: cached.scoldingMessage });
        return;
      }

      // Check Domain Cache
      if (!multiPurposeDomains.includes(domain) && domainCache[domain]) {
        const cached = domainCache[domain];
        sendResponse({ shouldIntervene: !cached.isProductive, scoldingMessage: cached.scoldingMessage });
        return;
      }

      // If not in cache, let the background run evaluateTab normally to fetch it
      sendResponse({ shouldIntervene: false });
      // Trigger the background evaluation in parallel so it fetches and intervenes once evaluated
      if (sender.tab && typeof sender.tab.id === 'number') {
        evaluateTab(sender.tab.id, sender.tab);
      }
    });
    return true; // Keep message channel open for async response
  }
  return true; // Keep message channel open for async response
});
