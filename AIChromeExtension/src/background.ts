// Oji-San AI Focus Extension - Background Service Worker

const systemPrompt = `
You are Master Oji-San, the legendary, strict, and slightly eccentric grandmaster of the 36th Chamber of Code. Your job is to monitor your disciple's (the user's) web browsing and ensure they are staying focused on their goal.

You will be given the User's Focus Goal, the Title of the webpage they just opened, and the URL.

Step 1: Evaluate the Context.
Determine if the webpage is genuinely helping them achieve their goal. 
- If their goal is "Learn React" and they are on a YouTube video titled "React Hooks Tutorial", that IS productive.
- If their goal is "Learn React" and they are on a YouTube video titled "Top 10 Anime Betrayals", that IS NOT productive.
- Social media (Twitter, Instagram, Reddit) and streaming sites (Netflix, Hulu) are almost always unproductive unless explicitly related to the goal.

Step 2: Generate the Output.
Return a strict JSON object (do not return any markdown or other text).
{
  "isProductive": boolean,
  "scoldingMessage": string
}

If 'isProductive' is true, the 'scoldingMessage' should be empty ("").

If 'isProductive' is false, generate a 'scoldingMessage' speaking strictly in the persona of Master Oji-San. 
Rules for the scolding message:
- Start with an insult to their discipline (e.g., "Foolish disciple!", "Dishonor!", "Weak focus!").
- Relate their distraction (the webpage title) to martial arts or ancient training.
- Be dramatic, funny, and strict. Do not be polite.
- Keep it under 3 sentences.

Example Scolding Messages:
- "Foolish disciple! You claim you wish to learn Python, yet I catch you staring at 'Cat fails compilation' on YouTube! Your discipline is weaker than a wet noodle. Close this tab before I make you punch a tree for 10 hours!"
- "Dishonor to your keyboard! Netflix will not teach you the Way of the Code. A true master builds, he does not binge-watch. Return to your studies immediately!"
- "Ah, I see. You think scrolling through Reddit will strengthen your mind? The only thing getting stronger is your ability to fail your goals. Leave this place!"
`;

// Set to track active API evaluations in-flight and prevent race condition duplicate calls
const inFlightEvaluations = new Set<string>();

// List of multi-purpose domains that must be screened at URL-level rather than blocked domain-wide
const multiPurposeDomains = ['youtube.com', 'github.com', 'google.com', 'wikipedia.org', 'localhost', '127.0.0.1'];

// Helper to extract hostname from URL
function getHostname(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.hostname;
  } catch {
    return '';
  }
}

// Helper to extract registered domain (second-level domain, e.g., keka.com)
function getDomain(urlStr: string): string {
  try {
    const hostname = getHostname(urlStr);
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }
    return hostname;
  } catch {
    return '';
  }
}

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
      if (whitelisted.includes(hostname) || whitelisted.includes(domain)) {
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
          let evaluation: { isProductive: boolean; scoldingMessage: string };

          if (aiProvider === 'groq') {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqApiKey}`
              },
              body: JSON.stringify({
                model: groqModel || 'openai/gpt-oss-20b',
                messages: [
                  {
                    role: 'system',
                    content: systemPrompt
                  },
                  {
                    role: 'user',
                    content: `User Focus Goal: "${focusGoal}"\nWebpage Title: "${tab.title || ''}"\nURL: "${url}"`
                  }
                ],
                response_format: {
                  type: 'json_object'
                },
                temperature: 0.2
              })
            });

            if (!response.ok) {
              throw new Error(`Groq API returned status ${response.status}`);
            }

            const resData = await response.json();
            const contentStr = resData.choices?.[0]?.message?.content;
            if (!contentStr) {
              throw new Error('Empty response from Groq');
            }
            evaluation = JSON.parse(contentStr) as { isProductive: boolean; scoldingMessage: string };
          } else {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel || 'gemini-2.5-flash'}:generateContent?key=${geminiApiKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `User Focus Goal: "${focusGoal}"\nWebpage Title: "${tab.title || ''}"\nURL: "${url}"`,
                      },
                    ],
                  },
                ],
                systemInstruction: {
                  parts: [
                    {
                      text: systemPrompt,
                    },
                  ],
                },
                generationConfig: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                    type: 'OBJECT',
                    properties: {
                      isProductive: {
                        type: 'BOOLEAN',
                      },
                      scoldingMessage: {
                        type: 'STRING',
                      },
                    },
                    required: ['isProductive', 'scoldingMessage'],
                  },
                },
              }),
            });

            if (!response.ok) {
              throw new Error(`Gemini API returned status ${response.status}`);
            }

            const resData = await response.json();
            const contentStr = resData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!contentStr) {
              throw new Error('Empty response from Gemini');
            }
            evaluation = JSON.parse(contentStr) as { isProductive: boolean; scoldingMessage: string };
          }

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
    const hostname = getHostname(sender.tab.url);
    const domain = getDomain(sender.tab.url);
    if (hostname) {
      chrome.storage.local.get(['bypassUrls'], (data) => {
        const whitelisted = Array.isArray(data.bypassUrls) ? data.bypassUrls : [];
        if (!whitelisted.includes(hostname)) {
          whitelisted.push(hostname);
        }
        if (domain && !whitelisted.includes(domain)) {
          whitelisted.push(domain);
        }
        chrome.storage.local.set({ bypassUrls: whitelisted }, () => {
          console.log(`[Oji-San] Whitelisted ${hostname} and domain ${domain} for this session.`);
        });
      });
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Invalid URL' });
    }
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
