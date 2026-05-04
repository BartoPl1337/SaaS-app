import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";
import { components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_COMPLETED"
  | "TASK_COMMENTED"
  | "MEMBER_ADDED";

export type NotificationEntityType = "workspace" | "task" | "comment";

export async function notifyUser(
  ctx: MutationCtx,
  args: {
    userId: string;
    actorId: string;
    workspaceId: Id<"workspaces">;
    type: NotificationType;
    entityId: string;
    entityType: NotificationEntityType;
    metadata?: Record<string, unknown>;
  },
) {
  if (args.userId === args.actorId) return;
  await ctx.db.insert("notifications", {
    userId: args.userId,
    actorId: args.actorId,
    workspaceId: args.workspaceId,
    type: args.type,
    entityId: args.entityId,
    entityType: args.entityType,
    metadata: args.metadata,
    read: false,
  });
}

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];

    const limit = args.limit ?? 20;

    const items = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    const actorIds = Array.from(new Set(items.map((n) => n.actorId)));
    const actors = await Promise.all(
      actorIds.map(async (id) => {
        const u = await ctx.runQuery(components.betterAuth.adapter.findOne, {
          model: "user",
          where: [{ field: "_id", value: id }],
        });
        return [id, u] as const;
      }),
    );
    const actorMap = new Map(actors);

    const workspaceIds = Array.from(new Set(items.map((n) => n.workspaceId)));
    const workspaces = await Promise.all(workspaceIds.map((id) => ctx.db.get(id)));
    const workspaceMap = new Map(
      workspaces
        .filter((w): w is NonNullable<typeof w> => !!w)
        .map((w) => [w._id, w]),
    );

    return items.map((n) => ({
      ...n,
      actor: actorMap.get(n.actorId) ?? null,
      workspace: workspaceMap.get(n.workspaceId) ?? null,
    }));
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", user._id).eq("read", false))
      .collect();

    return unread.length;
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Brak autoryzacji");

    const n = await ctx.db.get(args.id);
    if (!n || n.userId !== user._id) return;

    await ctx.db.patch(args.id, { read: true });
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Brak autoryzacji");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", user._id).eq("read", false))
      .collect();

    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});
