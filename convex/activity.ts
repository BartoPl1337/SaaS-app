import { v } from "convex/values";
import { query, MutationCtx } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";
import { components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

export type ActivityType =
  | "TASK_CREATED"
  | "TASK_COMMENTED"
  | "TASK_COMPLETED"
  | "TASK_MOVED"
  | "TASK_ASSIGNED"
  | "TASK_EDITED"
  | "TASK_ATTACHED"
  | "TASK_DELETED"
  | "BOARD_CREATED"
  | "BOARD_EDITED"
  | "BOARD_DELETED";

export type ActivityEntityType = "workspace" | "board" | "task" | "comment";

export async function logActivity(
  ctx: MutationCtx,
  args: {
    workspaceId: Id<"workspaces">;
    userId: string;
    type: ActivityType;
    entityId: string;
    entityType: ActivityEntityType;
    metadata?: Record<string, unknown>;
  },
) {
  await ctx.db.insert("activity", args);
}

export const listForUser = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const workspaceIds = memberships.map((m) => m.workspaceId);
    if (workspaceIds.length === 0) return [];

    const limit = args.limit ?? 100;

    const perWorkspace = await Promise.all(
      workspaceIds.map((wid) =>
        ctx.db
          .query("activity")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", wid))
          .order("desc")
          .take(limit),
      ),
    );

    const activities = perWorkspace.flat();
    activities.sort((a, b) => b._creationTime - a._creationTime);
    const trimmed = activities.slice(0, limit);

    const userIds = Array.from(new Set(trimmed.map((a) => a.userId)));
    const users = await Promise.all(
      userIds.map(async (id) => {
        const u = await ctx.runQuery(components.betterAuth.adapter.findOne, {
          model: "user",
          where: [{ field: "_id", value: id }],
        });
        return [id, u] as const;
      }),
    );
    const userMap = new Map(users);

    const uniqueWorkspaceIds = Array.from(
      new Set(trimmed.map((a) => a.workspaceId)),
    );
    const workspaces = await Promise.all(
      uniqueWorkspaceIds.map((id) => ctx.db.get(id)),
    );
    const workspaceMap = new Map(
      workspaces
        .filter((w): w is NonNullable<typeof w> => !!w)
        .map((w) => [w._id, w]),
    );

    return trimmed.map((a) => ({
      ...a,
      user: userMap.get(a.userId) ?? null,
      workspace: workspaceMap.get(a.workspaceId) ?? null,
    }));
  },
});
