import { createOpenRouter } from '@openrouter/ai-sdk-provider';


const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const defaultModel = process.env.OPENROUTER_DEFAULT_MODEL || 'openrouter/free';

export function getAgent() {
  return openRouter(defaultModel);
}