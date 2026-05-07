import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";
import type { Id } from "./_generated/dataModel";

async function ensureMember(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  userId: string,
) {
  const membership = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_user", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .unique();
  if (!membership) throw new Error("Brak dostępu do projektu");
  return membership;
}

export const list = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id),
      )
      .unique();
    if (!membership) return [];

    return ctx.db
      .query("sprints")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    goal: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Brak autoryzacji");
    const m = await ensureMember(ctx, args.workspaceId, user._id);
    if (m.role === "viewer") throw new Error("Brak uprawnień");

    return ctx.db.insert("sprints", {
      workspaceId: args.workspaceId,
      name: args.name,
      goal: args.goal,
      status: "planned",
      startDate: args.startDate,
      endDate: args.endDate,
      createdBy: user._id,
    });
  },
});

export const start = mutation({
  args: { id: v.id("sprints") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Brak autoryzacji");

    const sprint = await ctx.db.get(args.id);
    if (!sprint) throw new Error("Sprint nie istnieje");

    const m = await ensureMember(ctx, sprint.workspaceId, user._id);
    if (m.role === "viewer") throw new Error("Brak uprawnień");

    const active = await ctx.db
      .query("sprints")
      .withIndex("by_workspace_status", (q) =>
        q.eq("workspaceId", sprint.workspaceId).eq("status", "active"),
      )
      .unique();
    if (active && active._id !== sprint._id) {
      throw new Error("Inny sprint jest już aktywny");
    }

    await ctx.db.patch(args.id, {
      status: "active",
      startDate: sprint.startDate ?? Date.now(),
    });
  },
});

export const complete = mutation({
  args: { id: v.id("sprints") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Brak autoryzacji");

    const sprint = await ctx.db.get(args.id);
    if (!sprint) throw new Error("Sprint nie istnieje");

    const m = await ensureMember(ctx, sprint.workspaceId, user._id);
    if (m.role === "viewer") throw new Error("Brak uprawnień");

    await ctx.db.patch(args.id, {
      status: "completed",
      endDate: Date.now(),
    });

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.id))
      .collect();

    for (const t of tasks) {
      if (t.status !== "done") {
        await ctx.db.patch(t._id, { sprintId: undefined, updatedAt: Date.now() });
      }
    }
  },
});

export const remove = mutation({
  args: { id: v.id("sprints") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Brak autoryzacji");

    const sprint = await ctx.db.get(args.id);
    if (!sprint) return;

    const m = await ensureMember(ctx, sprint.workspaceId, user._id);
    if (m.role !== "owner") throw new Error("Tylko właściciel może usunąć sprint");

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.id))
      .collect();
    for (const t of tasks) {
      await ctx.db.patch(t._id, { sprintId: undefined, updatedAt: Date.now() });
    }

    await ctx.db.delete(args.id);
  },
});
