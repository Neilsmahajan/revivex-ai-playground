import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { apiKey, model, systemPrompt, context, userPrompt } = body;

  if (!apiKey || typeof apiKey !== "string") {
    return Response.json({ error: "API key is required" }, { status: 400 });
  }
  if (!model || typeof model !== "string") {
    return Response.json({ error: "Model is required" }, { status: 400 });
  }
  if (!userPrompt || typeof userPrompt !== "string") {
    return Response.json({ error: "User prompt is required" }, { status: 400 });
  }

  const messages: { role: string; content: string }[] = [];

  // Build system message from system prompt + context
  const systemParts: string[] = [];
  if (systemPrompt && typeof systemPrompt === "string" && systemPrompt.trim()) {
    systemParts.push(systemPrompt.trim());
  }
  if (context && typeof context === "string" && context.trim()) {
    systemParts.push(`\n\nContext:\n${context.trim()}`);
  }
  if (systemParts.length > 0) {
    messages.push({ role: "system", content: systemParts.join("") });
  }

  messages.push({ role: "user", content: userPrompt });

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://revivex-ai-playground.vercel.app",
          "X-Title": "AI Playground",
        },
        body: JSON.stringify({
          model,
          messages,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(
        {
          error:
            errorData?.error?.message ||
            `OpenRouter API error: ${response.status}`,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    const usage = data?.usage ?? null;
    return Response.json({ content, usage });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
