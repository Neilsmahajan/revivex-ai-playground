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
  }).index("by_user", ["userId"]),
});
