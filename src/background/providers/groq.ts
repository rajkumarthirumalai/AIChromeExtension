import { LLMProvider } from './base';

export class GroqProvider extends LLMProvider {
  async evaluate(
    goal: string,
    title: string,
    url: string
  ): Promise<{ isProductive: boolean; scoldingMessage: string }> {
    const modelName = this.model || 'openai/gpt-oss-20b';
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: this.systemPrompt
          },
          {
            role: 'user',
            content: `User Focus Goal: "${goal}"\nWebpage Title: "${title}"\nURL: "${url}"`
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

    return JSON.parse(contentStr) as { isProductive: boolean; scoldingMessage: string };
  }
}
