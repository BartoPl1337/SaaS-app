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

export type PrefKey =
  | "taskAssigned"
  | "taskComment"
  | "mentions"
  | "taskDue"
  | "taskCompleted"
  | "statusChange"
  | "boardInvite"
  | "weeklyDigest";

export const DEFAULT_PREFS: Record<PrefKey, boolean> = {
  taskAssigned:  true,
  taskComment:   true,
  mentions:      true,
  taskDue:       true,
  taskCompleted: false,
  statusChange:  false,
  boardInvite:   true,
  weeklyDigest:  false,
};

const TYPE_TO_PREF: Record<NotificationType, PrefKey> = {
  TASK_ASSIGNED:  "taskAssigned",
  TASK_COMPLETED: "taskCompleted",
  TASK_COMMENTED: "taskComment",
  MEMBER_ADDED:   "boardInvite",
};

async function isNotificationEnabled(
  ctx: MutationCtx,
  userId: string,
  type: NotificationType,
): Promise<boolean> {
  const prefKey = TYPE_TO_PREF[type];
  if (!prefKey) return true;

  const prefs = await ctx.db
    .query("notificationPrefs")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  const stored = prefs?.[prefKey];
  return stored ?? DEFAULT_PREFS[prefKey];
}

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

  const enabled = await isNotificationEnabled(ctx, args.userId, args.type);
  if (!enabled) return;

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

export const getPrefs = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return DEFAULT_PREFS;

    const prefs = await ctx.db
      .query("notificationPrefs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const result: Record<PrefKey, boolean> = { ...DEFAULT_PREFS };
    if (prefs) {
      for (const k of Object.keys(DEFAULT_PREFS) as PrefKey[]) {
        const v = prefs[k];
        if (typeof v === "boolean") result[k] = v;
      }
    }
    return result;
  },
});

export const updatePrefs = mutation({
  args: {
    taskAssigned:  v.optional(v.boolean()),
    taskComment:   v.optional(v.boolean()),
    mentions:      v.optional(v.boolean()),
    taskDue:       v.optional(v.boolean()),
    taskCompleted: v.optional(v.boolean()),
    statusChange:  v.optional(v.boolean()),
    boardInvite:   v.optional(v.boolean()),
    weeklyDigest:  v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Brak autoryzacji");

    const existing = await ctx.db
      .query("notificationPrefs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const patch: Record<string, unknown> = {};
    for (const k of Object.keys(args) as PrefKey[]) {
      const val = args[k];
      if (val !== undefined) patch[k] = val;
    }

    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("notificationPrefs", {
        userId: user._id,
        ...patch,
      });
    }
  },
});

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
