# Oji-San AI Dojo Focus Extension ⚔️

**Oji-San AI Dojo** is a strict, gamified, and highly aesthetic Chrome extension designed to keep you aligned with your learning and training goals. Under the watchful eye of **Master Oji-San**, the legendary and eccentric grandmaster of the 36th Chamber of Code, you will build discipline, slash distractions, and learn python/AWS/React without losing focus.

Powered by **Google Gemini** and **Groq Cloud** APIs, Oji-San monitors your web traffic and scolds you with ancient martial-arts-themed insults whenever you stray from your active training goal.

---

## 📦 Quick Install (No Build Required)

For easy sharing with college students and professors, a pre-compiled version of the extension is committed directly in this repository:

1. **Download the Zip**: Download [oji-san-dojo.zip](./oji-san-dojo.zip) from the repository root.
2. **Unzip**: Extract the zip archive onto your computer (it will create a `dist` folder).
3. **Load in Chrome**:
   - Go to `chrome://extensions/` in Google Chrome.
   - Enable **Developer mode** (toggle in the top-right corner).
   - Click **Load unpacked** in the top-left.
   - Select the extracted `dist` folder.
4. **Configure Settings**: Click the Oji-San icon in your extension bar, click the Gear icon, enter your API key (Gemini/Groq), set your Focus Goal, open the Dojo Gate, and start sparring!

---


## 🛠 Core Features

### 1. Dojo Gate (AI Web Blocker)
When active, Oji-San evaluates the active tab's URL and title. If it is unproductive or unrelated to your focus goal (e.g. browsing Netflix when your goal is "Learn AWS"), Oji-San blocks the viewport with a full-screen scolding intervention card.

### 2. YouTube Shield (Unhook Mode)
An **AI-free, zero-API-cost** filter that shields you from recommendation loops on YouTube:
*   **Homepage Feed Lock**: Completely hides the infinite recommendations grid and injects a centered **Dojo Search Banner** instructing you to use the search bar for goal-related topics.
*   **Watch Page Sidebar & Comments Hider**: Hides sidebar recommendations and comments sections completely, keeping you focused strictly on the tutorial player.
*   **Active Player Blocker**: If you manually open an off-topic video (e.g. music/gaming), Oji-San intercepts and blocks the page!

### 3. Dual LLM Provider Support
Switch between providers inside the **Dojo Settings Panel** (Gear icon):
*   **Google Gemini**: Use `gemini-2.5-flash` or `gemini-2.0-flash`.
*   **Groq Cloud**: Use high-performance free models like `openai/gpt-oss-20b` (Recommended), Llama 3.3, or Llama 3.1.
*   *Strict JSON Mode* is enabled on both providers to ensure fast, structured, and parse-safe responses.

### 4. Double-Evaluation Race Protection
An in-flight locks registry (`inFlightEvaluations`) prevents concurrent duplicate API calls for the same URL, which often happen during SPA transitions or quick redirects.

### 5. Domain-Level Caching
To protect your free API limits:
*   Classifications for general sites are stored persistently at the **domain level** (e.g. `keka.com`, `netflix.com`).
*   Once a single page on that domain is classified as unproductive, the entire domain is immediately blocked for your session without consuming any additional API calls.
*   Multi-purpose sites (like GitHub, Wikipedia, Google) are still checked at the URL level to allow productive pages while blocking distractions.

### 6. CSP & Style Isolation
*   **Shadow DOM Isolation**: The intervention overlay renders inside an isolated Shadow DOM, preventing host page CSS (like Netflix or Keka) from warping the Dojo UI layout.
*   **Base64 Asset Loader**: Assets (like Oji-San's sprite) are loaded via Base64 data URLs to bypass strict Content Security Policies (CSP) on third-party sites.
*   **Dojo Load Handshake**: The content script runs a handshake with the background worker on load. This instantly displays the scolding overlay on blocked pages before the host DOM finishes rendering, avoiding redirect bypasses.

---

## 🚀 Installation & Build

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [npm](https://www.npmjs.com/)

### 1. Compile Dojo Assets
Clone the repository and run the following commands in the directory root:
```bash
# Install dependencies
npm install

# Compile the extension
npm run build
```
This compiles the extension into the `/dist` directory.

### 2. Load into Chrome
1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable **Developer mode** (toggle in the top-right corner).
3.  Click **Load unpacked** in the top-left.
4.  Select the `dist/` directory inside this project folder.

### 3. Configure API Keys
1.  Click the Oji-San extension icon in your Chrome toolbar.
2.  Click the **Gear Icon** in the top right to open settings.
3.  Choose your AI Provider (**Gemini** or **Groq**), enter your API Key, select your model, and set your active goal.
4.  Toggle the **Dojo Gate** and **YouTube Shield** to active and start training!
