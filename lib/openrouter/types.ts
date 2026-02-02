export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export interface OpenRouterError {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}
