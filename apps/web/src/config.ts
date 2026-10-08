const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
export const API_URL = env['VITE_SORO_API_URL'] ?? 'http://localhost:3000';
export const VAPI_PUBLIC_KEY = env['VITE_VAPI_PUBLIC_KEY'] ?? '';
export const VAPI_ASSISTANT_ID =
  env['VITE_VAPI_ASSISTANT_ID'] ?? '440f103a-2190-4780-8844-6ce9a9fdb441';
export const COMMAND_CENTER_URL =
  env['VITE_COMMAND_CENTER_URL'] ?? 'https://command-center-89ltykpmr-oluwadareanuoluwapo458-7684.vercel.app';
