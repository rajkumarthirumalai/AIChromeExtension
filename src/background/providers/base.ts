// Abstract Base Class for LLM Providers

export interface LLMProviderOptions {
  apiKey: string;
  model: string;
  systemPrompt: string;
}

export abstract class LLMProvider {
  protected apiKey: string;
  protected model: string;
  protected systemPrompt: string;

  constructor(options: LLMProviderOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model;
    this.systemPrompt = options.systemPrompt;
  }

  abstract evaluate(
    goal: string, 
    title: string, 
    url: string
  ): Promise<{ isProductive: boolean; scoldingMessage: string }>;

  abstract evaluateExcuse(
    goal: string, 
    title: string, 
    url: string,
    excuse: string
  ): Promise<{ excuseAccepted: boolean; roastMessage: string }>;
}
