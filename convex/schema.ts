import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  prompts: defineTable({
    userId: v.string(),
    systemPrompt: v.string(),
    context: v.string(),
    model: v.string(),
    userPrompt: v.string(),
    output: v.string(),
    createdAt: v.number(),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
    cost: v.optional(v.number()),
  }).index("by_user", ["userId"]),
});
