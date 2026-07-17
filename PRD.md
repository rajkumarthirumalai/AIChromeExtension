Project PRD: Oji-San (AI Chrome Extension)

1. Overview

App Name: Oji-San

Tagline: The strict, wise, 36th Chamber AI Master that beats distraction out of you.

Description: A context-aware Chrome Extension (Manifest V3). It tracks browser usage and enforces a "Focus Mode". Unlike dumb URL blockers, it uses an LLM to evaluate the context of the current page against a user-defined goal. If the user slacks off, it intervenes by injecting a full-page overlay scolding them in the persona of Oji-San (an eccentric martial arts master).

2. Tech Stack & Environment (Latest LTS Standards)

Build Tool: Vite (Latest LTS v5.x)

Extension Plugin: @crxjs/vite-plugin (Use @beta tag for Vite 5 compatibility)

Framework: React 18 (LTS) + TypeScript

Styling: Tailwind CSS (Latest stable) + Lucide React (for standard icons)

State / Storage: chrome.storage.local (Mandatory for Manifest V3 extension state)

Extension Standard: Manifest V3 (Service Workers only, no persistent background pages)

AI API: OpenAI API (Called exclusively from the Background Service Worker to avoid CORS and Content Security Policy issues).

3. Core Features

3.1 The Dojo Dashboard (Popup UI)

Focus Goal Input: A text input where the user sets their current objective (e.g., "Studying for AWS Certification", "Learning React").

Dojo Toggle: A large, highly visible switch to activate/deactivate "Focus Mode".

Discipline Stats: A progress bar or simple stat counter reading daily metrics (e.g., "Pages Evaluated: 20 | Distractions Blocked: 4").

Storage: Saves the Goal and Toggle state to chrome.storage.local.

3.2 Context-Aware Evaluator (Background Service Worker)

Event Listener: Uses chrome.tabs.onUpdated to trigger when a tab's status === 'complete'.

State Check: Verifies if "Focus Mode" is ON via chrome.storage.local.

Data Extraction: Grabs the tab.url and tab.title.

AI Engine: Makes an asynchronous fetch call to the OpenAI API using the system prompt below. Demands a JSON output to guarantee parsing reliability.

Dispatcher: If isProductive is false, it uses chrome.tabs.sendMessage to trigger the Content Script in the active tab.

3.3 The Oji-San Intervention (Content Script)

Listener: Waits for a message from the background script containing the scoldingMessage.

DOM Injection: Creates a shadow DOM or a high z-index div (z-[999999]) directly in the user's current webpage.

UI Overlay: A backdrop-blur full-screen overlay. Displays the scoldingMessage in large, dramatic text.

Visual Assets: Placeholder for a 2D Pixel Sprite of Master Oji-San (an angry/disappointed pixel art sensei).

Action Button: A button labeled "Forgive me Oji-San, I will close this tab" which, when clicked, triggers window.close() or removes the overlay.

4. The AI System Prompt

Use this exact prompt when calling the OpenAI API from the background script. Ensure response_format: { type: "json_object" } is passed to the API.

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


5. Implementation Guide for AI Agent

Agent, please follow these steps sequentially. Do not move to the next step until the current one is fully functional.

Step 1: Project Scaffolding.

Initialize Vite + React + TypeScript.

Install @crxjs/vite-plugin@beta and configure vite.config.ts for Manifest V3.

Set up Tailwind CSS.

Step 2: Popup UI.

Create src/popup/Popup.tsx.

Build the UI for entering the focus goal and toggling the focus mode.

Implement saving/loading from chrome.storage.local.

Step 3: Background Service Worker.

Create src/background.ts.

Implement the chrome.tabs.onUpdated listener.

Add the logic to read the goal from storage.

Write the OpenAI fetch function using the provided systemPrompt. (Use import.meta.env.VITE_OPENAI_API_KEY for auth).

Step 4: Content Script (Intervention UI).

Create src/content.tsx.

Listen for chrome.runtime.onMessage.

When isProductive is false, inject the React overlay into the page.

Include a placeholder <img> tag where we will later inject a 2D Pixel Sprite of Oji-San.

Make the "Forgive me" button functional.

Step 5: Analytics/Stats Tracking.

In the background script, increment productiveCount or distractionCount in chrome.storage.local.

Display these stats in the Popup UI.

CRITICAL MANIFEST V3 RULES:

No eval() or new Function() in background scripts.

API calls MUST happen in background.ts, not content.tsx.

Use chrome.storage.local.get / .set correctly (it is asynchronous).