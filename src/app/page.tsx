"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const POPULAR_MODELS = [
  { id: "openai/gpt-4o", name: "GPT-4o" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4" },
  { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku" },
  { id: "google/gemini-2.5-flash-preview", name: "Gemini 2.5 Flash" },
  { id: "google/gemini-2.5-pro-preview", name: "Gemini 2.5 Pro" },
  { id: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick" },
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1" },
  { id: "mistralai/mistral-medium-3", name: "Mistral Medium 3" },
];

const API_KEY_STORAGE_KEY = "revivex-openrouter-key";

export default function Home() {
  const { user, isSignedIn } = useUser();
  const savePrompt = useMutation(api.prompts.save);

  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [model, setModel] = useState(POPULAR_MODELS[0].id);
  const [customModel, setCustomModel] = useState("");
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [context, setContext] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [usage, setUsage] = useState<{
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost?: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (saved) setApiKey(saved);
  }, []);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    }
  }, [apiKey]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your OpenRouter API key");
      return;
    }
    if (!userPrompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");
    setUsage(null);

    const selectedModel = useCustomModel ? customModel : model;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          model: selectedModel,
          systemPrompt,
          context,
          userPrompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setOutput(data.content);
      setUsage(data.usage ?? null);

      if (isSignedIn && user) {
        await savePrompt({
          userId: user.id,
          systemPrompt,
          context,
          model: selectedModel,
          userPrompt,
          output: data.content,
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
          cost: data.usage?.cost,
        });
      }
    } catch {
      setError("Failed to connect to the API");
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div
        className="flex flex-1 items-center justify-center px-4"
        style={{ minHeight: "calc(100vh - 57px)" }}
      >
        <div className="text-center animate-fade-in">
          {/* Decorative sparkle cluster */}
          <div className="relative mx-auto mb-8 h-24 w-24">
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: "var(--accent-muted)",
                border: "1px solid var(--accent-border)",
                transform: "rotate(6deg)",
              }}
            />
            <div
              className="absolute inset-0 rounded-2xl flex items-center justify-center"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
              }}
            >
              <svg
                className="h-10 w-10"
                style={{ color: "var(--accent)" }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                />
              </svg>
            </div>
          </div>
          <h1
            className="heading-serif text-4xl sm:text-5xl"
            style={{ color: "var(--text-primary)" }}
          >
            AI Playground
          </h1>
          <p
            className="mt-4 text-base max-w-sm mx-auto leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Test prompts, compare models, and explore outputs.
            <br />
            Sign in to get started.
          </p>
        </div>
      </div>
    );
  }

  const inputStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-primary)",
  };

  const labelStyle = { color: "var(--text-secondary)" };

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      {/* API Key Strip */}
      <div
        className="mb-7 rounded-lg p-3.5 animate-fade-in"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
              style={{
                background: "var(--accent-muted)",
                border: "1px solid var(--accent-border)",
              }}
            >
              <svg
                className="h-3.5 w-3.5"
                style={{ color: "var(--accent)" }}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                />
              </svg>
            </div>
            <div>
              <p
                className="text-[13px] font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                OpenRouter API Key
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Get yours at{" "}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: "var(--accent)" }}
                >
                  openrouter.ai/keys
                </a>
                {" · Stored locally"}
              </p>
            </div>
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full rounded-md px-3 py-2 pr-9 text-[13px] placeholder:opacity-30 focus:outline-none input-glow"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              {showApiKey ? (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Input Panel */}
        <div className="flex flex-col gap-5 animate-fade-in-delay-1">
          {/* Configuration Card */}
          <div
            className="rounded-lg p-5"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h2
              className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em]"
              style={labelStyle}
            >
              Configuration
            </h2>

            {/* Model Selection */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label
                  className="text-[13px] font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Model
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomModel(!useCustomModel)}
                  className="text-[11px] font-medium cursor-pointer transition-colors"
                  style={{ color: "var(--accent)" }}
                >
                  {useCustomModel ? "← Use preset" : "Custom model →"}
                </button>
              </div>
              {useCustomModel ? (
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="e.g. openai/gpt-4o"
                  className="w-full rounded-md px-3 py-2.5 text-[13px] placeholder:opacity-30 focus:outline-none input-glow"
                  style={inputStyle}
                />
              ) : (
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-md px-3 py-2.5 text-[13px] focus:outline-none cursor-pointer input-glow"
                  style={inputStyle}
                >
                  {POPULAR_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* System Prompt */}
            <div className="mb-5">
              <label
                className="mb-2 block text-[13px] font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                System Prompt
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a helpful assistant..."
                rows={3}
                className="w-full rounded-md px-3 py-2.5 text-[13px] placeholder:opacity-30 focus:outline-none resize-y input-glow"
                style={inputStyle}
              />
            </div>

            {/* Context */}
            <div>
              <label
                className="mb-2 block text-[13px] font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Context
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Paste reference material, docs, or context..."
                rows={4}
                className="w-full rounded-md px-3 py-2.5 text-[13px] placeholder:opacity-30 focus:outline-none resize-y input-glow"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Prompt Card */}
          <div
            className="rounded-lg p-5"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <label
              className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.15em]"
              style={labelStyle}
            >
              Prompt
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Ask anything..."
              rows={5}
              className="w-full rounded-md px-3 py-2.5 text-[13px] placeholder:opacity-30 focus:outline-none resize-y input-glow"
              style={inputStyle}
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-3 w-full rounded-md px-4 py-2.5 text-[13px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 btn-glow"
              style={{
                background: loading ? "var(--bg-elevated)" : "var(--accent)",
                color: loading ? "var(--text-secondary)" : "var(--bg-deep)",
                border: loading
                  ? "1px solid var(--border-default)"
                  : "1px solid var(--accent)",
              }}
            >
              {loading ? (
                <>
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                    />
                  </svg>
                  Run
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col animate-fade-in-delay-2">
          <div
            className="rounded-lg p-5 flex-1 flex flex-col min-h-[500px]"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                style={labelStyle}
              >
                Output
              </h2>
              {output && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium cursor-pointer transition-all"
                  style={{
                    background: copied ? "var(--teal-muted)" : "transparent",
                    border: `1px solid ${copied ? "var(--teal-border)" : "var(--border-default)"}`,
                    color: copied ? "var(--teal)" : "var(--text-secondary)",
                  }}
                >
                  {copied ? (
                    <>
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                        />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>

            {error && (
              <div
                className="mb-4 rounded-md px-4 py-3 text-[13px]"
                style={{
                  background: "var(--red-muted)",
                  border: "1px solid var(--red-border)",
                  color: "var(--red)",
                }}
              >
                {error}
              </div>
            )}

            {loading && !output && (
              <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div
                      className="h-10 w-10 rounded-full"
                      style={{ border: "2px solid var(--border-subtle)" }}
                    />
                    <div
                      className="absolute inset-0 h-10 w-10 rounded-full animate-spin"
                      style={{
                        border: "2px solid transparent",
                        borderTopColor: "var(--accent)",
                      }}
                    />
                  </div>
                  <span
                    className="text-[13px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Waiting for response...
                  </span>
                </div>
              </div>
            )}

            {!loading && !output && !error && (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <svg
                      className="h-7 w-7"
                      style={{ color: "var(--text-muted)" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                      />
                    </svg>
                  </div>
                  <p
                    className="text-[13px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Output will appear here
                  </p>
                </div>
              </div>
            )}

            {output && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto">
                  <pre
                    className="whitespace-pre-wrap rounded-md p-4 text-[13px] leading-relaxed font-mono"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {output}
                  </pre>
                </div>
                {usage && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Usage
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px]"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>In</span>
                      {usage.prompt_tokens.toLocaleString()}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px]"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>Out</span>
                      {usage.completion_tokens.toLocaleString()}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px]"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>Total</span>
                      {usage.total_tokens.toLocaleString()}
                    </span>
                    {usage.cost !== undefined && (
                      <span
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium"
                        style={{
                          background: "var(--teal-muted)",
                          border: "1px solid var(--teal-border)",
                          color: "var(--teal)",
                        }}
                      >
                        ${usage.cost.toFixed(6)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
