import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";
import { components } from "./_generated/api";

const TEMPLATE_BOARD_NAMES: Record<string, string> = {
  kanban: "Tablica Kanban",
  scrum: "Sprint backlog",
  list: "Lista zadań",
  blank: "Tablica",
};

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    template: v.optional(
      v.union(
        v.literal("kanban"),
        v.literal("scrum"),
        v.literal("list"),
        v.literal("blank"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Brak autoryzacji");

    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      description: args.description,
      color: args.color,
      icon: args.icon,
      ownerId: user._id,
    });

    await ctx.db.insert("workspaceMembers", {
      workspaceId,
      userId: user._id,
      role: "owner",
    });

    if (args.template) {
      await ctx.db.insert("boards", {
        workspaceId,
        name: TEMPLATE_BOARD_NAMES[args.template],
        createdBy: user._id,
      });
    }

    return workspaceId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const workspaces = await Promise.all(
      memberships.map((m) => ctx.db.get(m.workspaceId)),
    );

    return workspaces.filter((w) => w !== null);
  },
});

export const get = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return null;

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", args.id).eq("userId", user._id),
      )
      .unique();

    if (!membership) return null;

    return ctx.db.get(args.id);
  },
});

export const listBoards = query({
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
      .query("boards")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
  },
});

export const listRecentBoards = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const workspaces = await Promise.all(
      memberships.map((m) => ctx.db.get(m.workspaceId)),
    );
    const workspaceMap = new Map(
      workspaces.filter((w) => w !== null).map((w) => [w._id, w]),
    );

    const boardsByWorkspace = await Promise.all(
      memberships.map((m) =>
        ctx.db
          .query("boards")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", m.workspaceId))
          .collect(),
      ),
    );
    const boards = boardsByWorkspace.flat();
    boards.sort((a, b) => b._creationTime - a._creationTime);

    const limit = args.limit ?? 3;
    const trimmed = boards.slice(0, limit);

    const uniqueWorkspaceIds = Array.from(
      new Set(trimmed.map((b) => b.workspaceId)),
    );
    const memberCounts = await Promise.all(
      uniqueWorkspaceIds.map(async (wid) => {
        const all = await ctx.db
          .query("workspaceMembers")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", wid))
          .collect();
        return [wid, all.length] as const;
      }),
    );
    const memberCountByWorkspace = new Map(memberCounts);

    return Promise.all(
      trimmed.map(async (b) => {
        const tasks = await ctx.db
          .query("tasks")
          .withIndex("by_board", (q) => q.eq("boardId", b._id))
          .collect();
        return {
          _id: b._id,
          _creationTime: b._creationTime,
          name: b.name,
          workspace: workspaceMap.get(b.workspaceId) ?? null,
          taskCount: tasks.length,
          doneCount: tasks.filter((t) => t.status === "done").length,
          memberCount: memberCountByWorkspace.get(b.workspaceId) ?? 0,
        };
      }),
    );
  },
});

export const listMembers = query({
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

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return Promise.all(
      memberships.map(async (m) => {
        const u = await ctx.runQuery(components.betterAuth.adapter.findOne, {
          model: "user",
          where: [{ field: "_id", value: m.userId }],
        });
        return { ...m, user: u };
      }),
    );
  },
});
