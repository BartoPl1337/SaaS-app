import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";
import { components } from "./_generated/api";
import { logActivity } from "./activity";
import { notifyUser } from "./notifications";

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
      const boardName = TEMPLATE_BOARD_NAMES[args.template];
      const boardId = await ctx.db.insert("boards", {
        workspaceId,
        name: boardName,
        createdBy: user._id,
      });
      await logActivity(ctx, {
        workspaceId,
        userId: user._id,
        type: "BOARD_CREATED",
        entityId: boardId,
        entityType: "board",
        metadata: { boardName },
      });
    }

    return workspaceId;
  },
});

export const update = mutation({
  args: {
    id: v.id("workspaces"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Brak autoryzacji");

    const ws = await ctx.db.get(args.id);
    if (!ws) throw new Error("Projekt nie istnieje");

    const membership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", args.id).eq("userId", user._id),
      )
      .unique();
    if (!membership || membership.role === "viewer") {
      throw new Error("Brak uprawnień do edycji");
    }

    const patch: Record<string, unknown> = {};
    if (args.name !== undefined)        patch.name = args.name;
    if (args.description !== undefined) patch.description = args.description;
    if (args.color !== undefined)       patch.color = args.color;
    if (args.icon !== undefined)        patch.icon = args.icon;

    await ctx.db.patch(args.id, patch);
  },
});

export const addMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.optional(v.union(v.literal("member"), v.literal("viewer"))),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Brak autoryzacji");

    const myMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id),
      )
      .unique();
    if (!myMembership) throw new Error("Brak dostępu do projektu");
    if (myMembership.role !== "owner") {
      throw new Error("Tylko właściciel może dodawać członków");
    }

    const email = args.email.trim().toLowerCase();
    if (!email) throw new Error("Podaj adres email");

    const targetUser = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", value: email }],
    });
    if (!targetUser) throw new Error("Użytkownik o tym emailu nie istnieje");

    const existing = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", targetUser._id),
      )
      .unique();
    if (existing) throw new Error("Ten użytkownik jest już członkiem");

    await ctx.db.insert("workspaceMembers", {
      workspaceId: args.workspaceId,
      userId: targetUser._id,
      role: args.role ?? "member",
    });

    const workspace = await ctx.db.get(args.workspaceId);
    await notifyUser(ctx, {
      userId: targetUser._id,
      actorId: user._id,
      workspaceId: args.workspaceId,
      type: "MEMBER_ADDED",
      entityId: args.workspaceId,
      entityType: "workspace",
      metadata: { workspaceName: workspace?.name ?? "" },
    });
  },
});

export const removeMember = mutation({
  args: { membershipId: v.id("workspaceMembers") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Brak autoryzacji");

    const target = await ctx.db.get(args.membershipId);
    if (!target) return;

    const myMembership = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", target.workspaceId).eq("userId", user._id),
      )
      .unique();
    if (!myMembership) throw new Error("Brak dostępu do projektu");
    if (myMembership.role !== "owner") {
      throw new Error("Tylko właściciel może usuwać członków");
    }
    if (target.role === "owner") {
      throw new Error("Nie można usunąć właściciela projektu");
    }

    await ctx.db.delete(args.membershipId);
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

    const ws = await ctx.db.get(args.id);
    if (!ws) return null;
    return { ...ws, viewerRole: membership.role };
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
