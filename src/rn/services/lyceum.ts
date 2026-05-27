import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};
const API_KEY: string = extra.lyceumApiKey ?? "";
const BASE_URL: string = extra.lyceumBaseUrl ?? "https://api.lyceum.technology";
const MODEL: string = extra.lyceumModel ?? "Qwen/Qwen2.5-VL-72B-Instruct";

const ENDPOINT = `${BASE_URL}/api/v2/external/serverless/chat/completions`;

console.log("[lyceum] endpoint:", ENDPOINT);
console.log("[lyceum] api key:", API_KEY ? `${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}` : "MISSING");
console.log("[lyceum] model:", MODEL);

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<{
        type: string;
        text?: string;
        image_url?: { url: string };
      }>;
}

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function chatCompletion(
  messages: ChatMessage[],
  opts?: { maxTokens?: number; temperature?: number },
): Promise<string> {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: opts?.maxTokens ?? 1000,
      temperature: opts?.temperature ?? 0.7,
      stream: false,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error("[lyceum] request failed:", resp.status, text);
    console.error("[lyceum] used key:", API_KEY ? `${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}` : "MISSING");
    throw new Error(`Lyceum API ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function ping(): Promise<string> {
  return chatCompletion(
    [{ role: "user", content: "Say hello in one sentence." }],
    { maxTokens: 50, temperature: 0 },
  );
}
