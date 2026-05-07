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
      <div className="flex flex-1 items-center justify-center px-4">
        <p className="text-zinc-400">Sign in to view your prompt history.</p>
      </div>
    );
  }

  if (prompts === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <svg
          className="h-8 w-8 animate-spin text-zinc-500"
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
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-zinc-700"
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
          <h2 className="text-lg font-semibold text-zinc-300">
            No history yet
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Run some prompts in the playground to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Prompt History</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {prompts.length} prompt{prompts.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {prompts.map((prompt) => {
          const isExpanded = expandedId === prompt._id;
          return (
            <div
              key={prompt._id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition-colors hover:border-zinc-700"
            >
              {/* Header - always visible */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : prompt._id)}
                className="w-full px-5 py-4 text-left cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">
                      {prompt.userPrompt}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-400">
                        {prompt.model}
                      </span>
                      <span className="text-xs text-zinc-600">
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
                        <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                          ${prompt.cost.toFixed(6)}
                        </span>
                      )}
                      {prompt.totalTokens !== undefined && (
                        <span className="text-xs text-zinc-600">
                          {prompt.totalTokens.toLocaleString()} tokens
                        </span>
                      )}
                    </div>
                  </div>
                  <svg
                    className={`h-5 w-5 shrink-0 text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
                <div className="border-t border-zinc-800 px-5 py-4 space-y-4">
                  {prompt.systemPrompt && (
                    <div>
                      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        System Prompt
                      </h3>
                      <pre className="whitespace-pre-wrap rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-3 text-sm text-zinc-300 font-mono">
                        {prompt.systemPrompt}
                      </pre>
                    </div>
                  )}

                  {prompt.context && (
                    <div>
                      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Context
                      </h3>
                      <pre className="whitespace-pre-wrap rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-3 text-sm text-zinc-300 font-mono max-h-48 overflow-auto">
                        {prompt.context}
                      </pre>
                    </div>
                  )}

                  <div>
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Prompt
                    </h3>
                    <pre className="whitespace-pre-wrap rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-3 text-sm text-zinc-300 font-mono">
                      {prompt.userPrompt}
                    </pre>
                  </div>

                  <div>
                    <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Output
                    </h3>
                    <pre className="whitespace-pre-wrap rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-3 text-sm text-zinc-200 font-mono max-h-96 overflow-auto">
                      {prompt.output}
                    </pre>
                  </div>

                  {(prompt.promptTokens !== undefined ||
                    prompt.completionTokens !== undefined ||
                    prompt.cost !== undefined) && (
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-800/30 px-3 py-2">
                      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mr-1">
                        Usage
                      </span>
                      {prompt.promptTokens !== undefined && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-zinc-700/50 bg-zinc-800/50 px-2 py-1 text-xs text-zinc-400">
                          <span className="text-zinc-500">In</span>
                          {prompt.promptTokens.toLocaleString()}
                        </span>
                      )}
                      {prompt.completionTokens !== undefined && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-zinc-700/50 bg-zinc-800/50 px-2 py-1 text-xs text-zinc-400">
                          <span className="text-zinc-500">Out</span>
                          {prompt.completionTokens.toLocaleString()}
                        </span>
                      )}
                      {prompt.totalTokens !== undefined && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-zinc-700/50 bg-zinc-800/50 px-2 py-1 text-xs text-zinc-400">
                          <span className="text-zinc-500">Total</span>
                          {prompt.totalTokens.toLocaleString()} tokens
                        </span>
                      )}
                      {prompt.cost !== undefined && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                          ${prompt.cost.toFixed(6)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(prompt.output)
                      }
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 cursor-pointer"
                    >
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
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/10 cursor-pointer"
                    >
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
