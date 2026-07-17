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
}
