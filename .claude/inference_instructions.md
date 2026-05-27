# Lyceum Serverless Inference — Integration Plan for ArriveAI

## How Lyceum Serverless Inference Works

Lyceum's Gateway API (`api.lyceum.technology`) has a **serverless inference** path that proxies requests to **Nebius Token Factory** (`api.tokenfactory.nebius.com/v1`). Unlike the dedicated Iris deployment path (which spins up vLLM replicas on Lyceum GPUs), the serverless path requires zero deployment — you send a request to the Gateway, it forwards it to Nebius, and you get an OpenAI-compatible response back.

### Architecture

```
ArriveAI App
    │
    │  POST /api/v2/external/serverless/chat/completions
    │  Authorization: Bearer lk_<api_key>
    │  Body: OpenAI chat completions format
    ▼
Lyceum Gateway (api.lyceum.technology)
    ├─ Auth: validates lk_ API key → resolves user + org
    ├─ Org context: resolves billing org (from key or X-Org-Slug header)
    ├─ Forwards request to Nebius with Lyceum's NEBIUS_API_KEY
    ├─ Handles streaming (SSE pass-through) or non-streaming
    └─ Reports usage to Croesus (billing) in background
    │
    ▼
Nebius Token Factory (api.tokenfactory.nebius.com/v1)
    └─ Runs Qwen2.5-VL-72B (and other models) as serverless endpoints
```

### Key Facts

- **Base URL**: `https://api.lyceum.technology`
- **Endpoint**: `POST /api/v2/external/serverless/chat/completions`
- **Models endpoint**: `GET /api/v2/external/serverless/models`
- **Auth**: `Authorization: Bearer lk_<your_api_key>` (Lyceum API key, starts with `lk_`)
- **Org header** (optional): `X-Org-Slug: <slug>` — if your key is org-scoped, this is not needed
- **Request format**: Standard OpenAI chat completions body
- **Response format**: Standard OpenAI chat completions response (streaming or non-streaming)
- **Model ID**: `Qwen/Qwen2.5-VL-72B-Instruct` (the HuggingFace model ID, passed in the `model` field)
- **Vision support**: Qwen2.5-VL-72B is a vision-language model — images are sent inline as base64 data URIs in the messages array

---

## API Reference

### Non-streaming request

```bash
curl -X POST https://api.lyceum.technology/api/v2/external/serverless/chat/completions \
  -H "Authorization: Bearer lk_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-VL-72B-Instruct",
    "messages": [
      {"role": "system", "content": "You are a helpful document assistant."},
      {"role": "user", "content": "What is this document?"}
    ],
    "max_tokens": 1000,
    "temperature": 0.7,
    "stream": false
  }'
```

### Streaming request

```bash
curl -X POST https://api.lyceum.technology/api/v2/external/serverless/chat/completions \
  -H "Authorization: Bearer lk_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen/Qwen2.5-VL-72B-Instruct",
    "messages": [...],
    "max_tokens": 1000,
    "stream": true
  }'
```

Returns SSE stream (`text/event-stream`) with chunks in OpenAI format:
```
data: {"id":"...","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"},"index":0}]}

data: [DONE]
```

### Sending an image (vision)

Images are passed as base64 data URIs inside the `content` array of a user message, following the OpenAI vision format:

```json
{
  "model": "Qwen/Qwen2.5-VL-72B-Instruct",
  "messages": [
    {
      "role": "system",
      "content": "You are ArriveAI, a document assistant for immigrants in Germany."
    },
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,/9j/4AAQ..."
          }
        },
        {
          "type": "text",
          "text": "What document is this? Explain what it says in plain English."
        }
      ]
    }
  ],
  "max_tokens": 2000,
  "temperature": 0.3,
  "stream": true
}
```

### Response format (non-streaming)

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "This is a Wohnungsgeberbestätigung (landlord confirmation)..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 1234,
    "completion_tokens": 567,
    "total_tokens": 1801
  }
}
```

### Available models

Query `GET /api/v2/external/serverless/models` to list all Nebius models. For ArriveAI, use:

| Model | HuggingFace ID | Purpose |
|-------|---------------|---------|
| Qwen2.5-VL-72B | `Qwen/Qwen2.5-VL-72B-Instruct` | Vision + language — document OCR, classification, explanation, chat |

---

## Lyceum CLI (for testing)

The Lyceum CLI can also be used to test serverless inference interactively. The CLI's `infer chat` command targets the Iris dedicated deployment path, not the serverless Nebius path. For serverless testing, use `curl` or a script that hits the Gateway `/api/v2/external/serverless/chat/completions` endpoint directly.

### CLI auth setup

```bash
pip install lyceum-cli
lyceum auth login          # opens browser, saves JWT + refresh token to ~/.lyceum/config.json
```

The CLI stores config at `~/.lyceum/config.json`:
```json
{
  "api_key": "lk_...",
  "base_url": "https://api.lyceum.technology",
  "dashboard_url": "https://dashboard.lyceum.technology"
}
```

---

## Integration Plan for ArriveAI

### Environment setup

Add to `.env` (gitignored):
```
LYCEUM_API_KEY=lk_your_api_key_here
LYCEUM_BASE_URL=https://api.lyceum.technology
LYCEUM_MODEL=Qwen/Qwen2.5-VL-72B-Instruct
```

In the React Native app, access via `process.env` or a config module that reads from `expo-constants`.

### Flow 1: Document scan → recognition → overview

**Trigger**: User captures/picks a photo on the Scan screen.

**Steps**:

1. **Capture image** — Use `expo-camera` or `expo-image-picker` to get the image.
2. **Encode to base64** — Convert the image file to a base64 data URI string.
3. **Send to Lyceum** — `POST /api/v2/external/serverless/chat/completions` with:
   - System prompt instructing the model to classify the document and return structured JSON
   - User message containing the image + a classification prompt
   - `stream: false` (we need the full structured response before navigating)
   - Low temperature (0.2–0.3) for deterministic classification
4. **Parse response** — Extract document type, summary, and matched checklist item from the model's response.
5. **Navigate** — Route user to Document Chat screen with the summary pre-populated.

**System prompt for classification**:
```
You are ArriveAI, a document assistant for immigrants in Germany.

The user has scanned a document as part of their "{application_type}" application.
The following documents are still missing for this application: {missing_documents_list}.

Analyze the image and respond with ONLY a JSON object:
{
  "document_type": "the German name of the document (e.g. Wohnungsgeberbestätigung)",
  "document_type_en": "English translation of the document type",
  "matched_document_id": "ID of the matching missing document slot, or null if no match",
  "confidence": 0.0 to 1.0,
  "summary": "2-3 sentence plain-English explanation of what this document is and what it says",
  "key_details": ["list", "of", "important", "extracted", "details"]
}
```

**Handling confidence**:
- `confidence >= 0.8` → auto-match to checklist slot, navigate to chat
- `confidence < 0.8` → show picker UI for user to confirm/select the correct document type

### Flow 2: Document chat (follow-up questions)

**Trigger**: User types a message in the Document Chat screen.

**Steps**:

1. **Build messages array** — Include:
   - System prompt with document context
   - The original image (as first user message, so the model has the document in context)
   - The AI-generated summary (as first assistant message)
   - Full chat history (all subsequent user/assistant turns)
   - The new user message
2. **Send to Lyceum** — `POST /api/v2/external/serverless/chat/completions` with `stream: true`.
3. **Stream response** — Parse SSE chunks and append tokens to the assistant bubble in real-time.

**System prompt for chat**:
```
You are ArriveAI, a friendly document assistant for immigrants in Germany.

The user is looking at a "{document_type}" document that is part of their "{application_type}" application.

Help them understand the document and answer questions about how to fill it out. Be concise and practical. If they ask about a specific field, tell them exactly what to write. Answer in the user's language (detect from their messages).
```

**Messages array structure**:
```json
[
  {"role": "system", "content": "<system prompt>"},
  {"role": "user", "content": [
    {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,..."}},
    {"type": "text", "text": "I scanned this document."}
  ]},
  {"role": "assistant", "content": "<AI summary from Flow 1>"},
  {"role": "user", "content": "What do I put in field 7?"},
  {"role": "assistant", "content": "Field 7 is your current address..."},
  {"role": "user", "content": "<new message>"}
]
```

### Implementation: API client module

Create a `src/rn/services/lyceum.ts` module:

```typescript
const LYCEUM_BASE_URL = process.env.LYCEUM_BASE_URL || 'https://api.lyceum.technology';
const LYCEUM_API_KEY = process.env.LYCEUM_API_KEY;
const LYCEUM_MODEL = process.env.LYCEUM_MODEL || 'Qwen/Qwen2.5-VL-72B-Instruct';

const ENDPOINT = `${LYCEUM_BASE_URL}/api/v2/external/serverless/chat/completions`;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

// Non-streaming (for document classification)
export async function classifyDocument(
  imageBase64: string,
  mimeType: string,
  applicationContext: { type: string; missingDocs: string[] },
): Promise<any> {
  const systemPrompt = `You are ArriveAI, a document assistant for immigrants in Germany.
The user scanned a document for their "${applicationContext.type}" application.
Missing documents: ${applicationContext.missingDocs.join(', ')}.
Respond with ONLY a JSON object: { "document_type", "document_type_en", "matched_document_id", "confidence", "summary", "key_details" }`;

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LYCEUM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: LYCEUM_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          { type: 'text', text: 'What document is this? Classify it and summarize it.' },
        ]},
      ],
      max_tokens: 1000,
      temperature: 0.2,
      stream: false,
    }),
  });

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  return JSON.parse(content);
}

// Streaming (for chat)
export async function* streamChat(
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LYCEUM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: LYCEUM_MODEL,
      messages,
      max_tokens: 1500,
      temperature: 0.7,
      stream: true,
    }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const chunk = JSON.parse(payload);
        const token = chunk.choices?.[0]?.delta?.content;
        if (token) yield token;
      } catch {}
    }
  }
}
```

### Implementation: Changes to DocumentChat.tsx

Replace canned replies with real streaming inference:

1. Store the document's base64 image in app state (captured at scan time).
2. On send, build the full messages array (system + image + history + new message).
3. Call `streamChat()` and append tokens to the latest assistant message as they arrive.
4. Show a typing indicator while waiting for the first token.

### Implementation: Changes to scan flow (App.tsx / ScanDocument.tsx)

1. After capturing/picking an image, read it as base64 using `expo-file-system`.
2. Call `classifyDocument()` with the base64 image and current application context.
3. Show a loading state ("Analyzing document...") during the API call.
4. On success, add the document to the application's documents array with the detected type.
5. Store the base64 image and summary in state for the chat screen.
6. Navigate to DocumentChat with the classification result.

### Cold start / timeout considerations

The Lyceum serverless endpoint proxies to Nebius. The Gateway `httpx.AsyncClient` is configured with:
- Connect timeout: 10s
- Read timeout: 120s (important for vision models which are slower)
- Write timeout: 30s

For the app:
- Show a meaningful loading state during the initial classification call (may take 5-15s for vision).
- For streaming chat, the first token may take a few seconds — show a typing indicator.
- If the request fails, show a retry button rather than a generic error.

### Security

- The `lk_` API key should be stored in a `.env` file (already gitignored) and loaded via Expo config.
- The key authenticates against Lyceum's Supabase-backed auth — it's hashed and looked up in the `api_keys` table.
- All requests go over HTTPS.
- Document images are sent to Lyceum → Nebius for inference only. Nebius does not persist request data. Lyceum logs token counts for billing but does not store image payloads.
- For production: consider a thin backend proxy so the API key isn't embedded in the mobile app bundle.
