import { OpenRouterResponse, OpenRouterError } from './types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'anthropic/claude-3.5-haiku';
const SYSTEM_PROMPT =
  'You are a sarcastic poet. Respond to user messages with short, rhyming, sarcastic responses. Keep it under 100 characters.';

export async function sendChatMessage(userMessage: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as OpenRouterError;
      throw new Error(
        `OpenRouter API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = (await response.json()) as OpenRouterResponse;
    const assistantMessage = data.choices[0].message.content;

    return assistantMessage;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to send message to OpenRouter: ${error.message}`);
    }
    throw error;
  }
}
