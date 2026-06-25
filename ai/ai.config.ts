import { createOpenRouter } from '@openrouter/ai-sdk-provider';


function envTrim(key: string): string | undefined {
  const v = process.env[key];
  return v?.replace(/^['"]|['"]$/g, '').trim() || undefined;
}

export function getAgentModel() {
  const apiKey = envTrim('OPENROUTER_API_KEY');
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set. Add it to your environment or .env file.');


  const provider = createOpenRouter({ apiKey });
  const modelId =
    envTrim('OPENROUTER_MODEL') ??
    envTrim('OPENROUTER_DEFAULT_MODEL') ??
    'openai/gpt-4o-mini';

  return provider(modelId);
}

// const openRouter = createOpenRouter({
//   apiKey: process.env.OPENROUTER_API_KEY,
// });

// const defaultModel = process.env.OPENROUTER_DEFAULT_MODEL || 'openrouter/free';

// export function getAgent() {
//   return openRouter(defaultModel);
// }