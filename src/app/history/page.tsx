"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";

export default function HistoryPage() {
  const { user, isSignedIn } = useUser();
  const prompts = useQuery(
    api.prompts.listByUser,
    isSignedIn && user ? { userId: user.id } : "skip",
  );
  const removePrompt = useMutation(api.prompts.remove);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isSignedIn) {
    return (
      <div
        className="flex flex-1 items-center justify-center px-4"
        style={{ minHeight: "calc(100vh - 57px)" }}
      >
        <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
          Sign in to view your prompt history.
        </p>
      </div>
    );
  }

  if (prompts === undefined) {
    return (
      <div
        className="flex flex-1 items-center justify-center"
        style={{ minHeight: "calc(100vh - 57px)" }}
      >
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
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div
        className="flex flex-1 items-center justify-center px-4"
        style={{ minHeight: "calc(100vh - 57px)" }}
      >
        <div className="text-center animate-fade-in">
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-xl"
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
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            No history yet
          </h2>
          <p
            className="mt-1.5 text-[13px]"
            style={{ color: "var(--text-muted)" }}
          >
            Run some prompts in the playground to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8">
      <div className="mb-7 flex items-end justify-between animate-fade-in">
        <div>
          <h1
            className="heading-serif text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            History
          </h1>
          <p
            className="mt-1.5 text-[13px]"
            style={{ color: "var(--text-muted)" }}
          >
            {prompts.length} prompt{prompts.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {prompts.map((prompt, index) => {
          const isExpanded = expandedId === prompt._id;
          return (
            <div
              key={prompt._id}
              className="rounded-lg overflow-hidden card-hover"
              style={{
                background: "var(--bg-surface)",
                border: `1px solid ${isExpanded ? "var(--border-strong)" : "var(--border-subtle)"}`,
                animationDelay: `${index * 0.05}s`,
              }}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : prompt._id)}
                className="w-full px-5 py-3.5 text-left cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[13px] font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {prompt.userPrompt}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          background: "var(--accent-muted)",
                          border: "1px solid var(--accent-border)",
                          color: "var(--accent)",
                        }}
                      >
                        {prompt.model}
                      </span>
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {new Date(prompt.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                      {prompt.cost !== undefined && (
                        <span
                          className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            background: "var(--teal-muted)",
                            border: "1px solid var(--teal-border)",
                            color: "var(--teal)",
                          }}
                        >
                          ${prompt.cost.toFixed(6)}
                        </span>
                      )}
                      {prompt.totalTokens !== undefined && (
                        <span
                          className="text-[11px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {prompt.totalTokens.toLocaleString()} tokens
                        </span>
                      )}
                    </div>
                  </div>
                  <svg
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    style={{ color: "var(--text-muted)" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div
                  className="px-5 py-4 space-y-4"
                  style={{ borderTop: "1px solid var(--border-subtle)" }}
                >
                  {prompt.systemPrompt && (
                    <div>
                      <h3
                        className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        System Prompt
                      </h3>
                      <pre
                        className="whitespace-pre-wrap rounded-md p-3 text-[13px] font-mono"
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {prompt.systemPrompt}
                      </pre>
                    </div>
                  )}

                  {prompt.context && (
                    <div>
                      <h3
                        className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Context
                      </h3>
                      <pre
                        className="whitespace-pre-wrap rounded-md p-3 text-[13px] font-mono max-h-48 overflow-auto"
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {prompt.context}
                      </pre>
                    </div>
                  )}

                  <div>
                    <h3
                      className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Prompt
                    </h3>
                    <pre
                      className="whitespace-pre-wrap rounded-md p-3 text-[13px] font-mono"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {prompt.userPrompt}
                    </pre>
                  </div>

                  <div>
                    <h3
                      className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Output
                    </h3>
                    <pre
                      className="whitespace-pre-wrap rounded-md p-3 text-[13px] font-mono max-h-96 overflow-auto"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {prompt.output}
                    </pre>
                  </div>

                  {(prompt.promptTokens !== undefined ||
                    prompt.completionTokens !== undefined ||
                    prompt.cost !== undefined) && (
                    <div
                      className="flex flex-wrap items-center gap-2 rounded-md px-3 py-2"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <span
                        className="text-[10px] font-semibold uppercase tracking-[0.15em] mr-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Usage
                      </span>
                      {prompt.promptTokens !== undefined && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px]"
                          style={{
                            background: "var(--bg-overlay)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <span style={{ color: "var(--text-muted)" }}>In</span>
                          {prompt.promptTokens.toLocaleString()}
                        </span>
                      )}
                      {prompt.completionTokens !== undefined && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px]"
                          style={{
                            background: "var(--bg-overlay)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <span style={{ color: "var(--text-muted)" }}>
                            Out
                          </span>
                          {prompt.completionTokens.toLocaleString()}
                        </span>
                      )}
                      {prompt.totalTokens !== undefined && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px]"
                          style={{
                            background: "var(--bg-overlay)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          <span style={{ color: "var(--text-muted)" }}>
                            Total
                          </span>
                          {prompt.totalTokens.toLocaleString()} tokens
                        </span>
                      )}
                      {prompt.cost !== undefined && (
                        <span
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium"
                          style={{
                            background: "var(--teal-muted)",
                            border: "1px solid var(--teal-border)",
                            color: "var(--teal)",
                          }}
                        >
                          ${prompt.cost.toFixed(6)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(prompt.output)
                      }
                      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium cursor-pointer transition-all"
                      style={{
                        border: "1px solid var(--border-default)",
                        color: "var(--text-secondary)",
                      }}
                    >
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
                      Copy Output
                    </button>
                    <button
                      onClick={async () => {
                        await removePrompt({ id: prompt._id as Id<"prompts"> });
                        setExpandedId(null);
                      }}
                      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium cursor-pointer transition-all"
                      style={{
                        border: "1px solid var(--red-border)",
                        color: "var(--red)",
                      }}
                    >
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
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
