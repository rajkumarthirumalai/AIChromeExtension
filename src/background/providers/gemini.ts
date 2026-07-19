import { LLMProvider } from './base';

export class GeminiProvider extends LLMProvider {
  async evaluate(
    goal: string,
    title: string,
    url: string
  ): Promise<{ isProductive: boolean; scoldingMessage: string }> {
    const modelName = this.model || 'gemini-2.5-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `User Focus Goal: "${goal}"\nWebpage Title: "${title}"\nURL: "${url}"`,
              },
            ],
          },
        ],
        systemInstruction: {
          parts: [
            {
              text: this.systemPrompt,
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

    return JSON.parse(contentStr) as { isProductive: boolean; scoldingMessage: string };
  }

  async evaluateExcuse(
    goal: string,
    title: string,
    url: string,
    excuse: string
  ): Promise<{ excuseAccepted: boolean; roastMessage: string }> {
    const modelName = this.model || 'gemini-2.5-flash';
    // Import excusePrompt inside the method to avoid circular dependencies if any, 
    // but better to import it at the top of the file, let me just require it or import it.
    // Actually, I can pass it through a new parameter or import it. I'll just import it.
    
    // I need to import excusePrompt at the top, I'll use another tool call for that.
    // For now I will just use a hardcoded fallback or import it inline.
    const { excusePrompt } = await import('../config');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `User Focus Goal: "${goal}"\nWebpage Title: "${title}"\nURL: "${url}"\nUser's Excuse: "${excuse}"`,
              },
            ],
          },
        ],
        systemInstruction: {
          parts: [
            {
              text: excusePrompt,
            },
          ],
        },
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              excuseAccepted: {
                type: 'BOOLEAN',
              },
              roastMessage: {
                type: 'STRING',
              },
            },
            required: ['excuseAccepted', 'roastMessage'],
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

    return JSON.parse(contentStr) as { excuseAccepted: boolean; roastMessage: string };
  }
}
