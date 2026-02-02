import { OpenRouterResponse, OpenRouterError } from './types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3.1-8b-instruct';
const SYSTEM_PROMPT =
  'We are writing a 2-line poem together: the user provides line 1, you provide line 2 only. Output MUST be exactly one line (line 2), no quotes, no extra text. Line 2 must be 3–8 words, sarcastic but not cruel, and it must rhyme with the user’s line 1 by matching the final word’s ending sound; if unsure, repeat the user’s final word as your final word. No profanity, slurs, emojis. Total output ≤70 characters.';
const USER_PREFIX = 'We write a 2-line poem together. I provide line 1, you provide line 2 only. First line: "';
const USER_SUFFIX = '" . Second line (from you): '

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
            content: USER_PREFIX + userMessage + USER_SUFFIX,
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
