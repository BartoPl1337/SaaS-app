import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";
import { components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const STATUS = v.union(
  v.literal("todo"),
  v.literal("inprogress"),
  v.literal("review"),
  v.literal("done"),
);

const PRIORITY = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("urgent"),
);

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

export const create = mutation({
  args: {
    boardId: v.id("boards"),
    title: v.string(),
    description: v.optional(v.string()),
    assigneeId: v.optional(v.string()),
    status: STATUS,
    priority: PRIORITY,
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Brak autoryzacji");

    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("Tablica nie istnieje");

    await ensureMember(ctx, board.workspaceId, user._id);

    const last = await ctx.db
      .query("tasks")
      .withIndex("by_board_status", (q) =>
        q.eq("boardId", args.boardId).eq("status", args.status),
      )
      .order("desc")
      .first();

    const order = last ? last.order + 1 : 0;

    return ctx.db.insert("tasks", {
      boardId: args.boardId,
      title: args.title,
      description: args.description,
      assigneeId: args.assigneeId,
      createdBy: user._id,
      status: args.status,
      priority: args.priority,
      dueDate: args.dueDate,
      order,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    assigneeId: v.optional(v.union(v.string(), v.null())),
    status: v.optional(STATUS),
    priority: v.optional(PRIORITY),
    dueDate: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Brak autoryzacji");

    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Zadanie nie istnieje");

    const board = await ctx.db.get(task.boardId);
    if (!board) throw new Error("Tablica nie istnieje");

    await ensureMember(ctx, board.workspaceId, user._id);

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined)       patch.title = args.title;
    if (args.description !== undefined) patch.description = args.description;
    if (args.assigneeId !== undefined)  patch.assigneeId = args.assigneeId ?? undefined;
    if (args.status !== undefined)      patch.status = args.status;
    if (args.priority !== undefined)    patch.priority = args.priority;
    if (args.dueDate !== undefined)     patch.dueDate = args.dueDate ?? undefined;

    await ctx.db.patch(args.id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Brak autoryzacji");

    const task = await ctx.db.get(args.id);
    if (!task) return;

    const board = await ctx.db.get(task.boardId);
    if (!board) throw new Error("Tablica nie istnieje");

    await ensureMember(ctx, board.workspaceId, user._id);

    await ctx.db.delete(args.id);
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assigneeId", user._id))
      .collect();

    const boardIds = Array.from(new Set(tasks.map((t) => t.boardId)));
    const boards = await Promise.all(boardIds.map((id) => ctx.db.get(id)));
    const boardMap = new Map(
      boards.filter((b): b is NonNullable<typeof b> => !!b).map((b) => [b._id, b]),
    );

    const workspaceIds = Array.from(
      new Set(
        boards
          .filter((b): b is NonNullable<typeof b> => !!b)
          .map((b) => b.workspaceId),
      ),
    );
    const workspaces = await Promise.all(workspaceIds.map((id) => ctx.db.get(id)));
    const workspaceMap = new Map(
      workspaces
        .filter((w): w is NonNullable<typeof w> => !!w)
        .map((w) => [w._id, w]),
    );

    return tasks.map((t) => {
      const board = boardMap.get(t.boardId) ?? null;
      const workspace = board ? workspaceMap.get(board.workspaceId) ?? null : null;
      return { ...t, board, workspace };
    });
  },
});

export const listByProject = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return [];

    await ensureMember(ctx, args.workspaceId, user._id);

    const boards = await ctx.db
      .query("boards")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const boardMap = new Map(boards.map((b) => [b._id, b]));

    const tasksByBoard = await Promise.all(
      boards.map((b) =>
        ctx.db
          .query("tasks")
          .withIndex("by_board", (q) => q.eq("boardId", b._id))
          .collect(),
      ),
    );
    const tasks = tasksByBoard.flat();

    const assigneeIds = Array.from(
      new Set(tasks.map((t) => t.assigneeId).filter((id): id is string => !!id)),
    );

    const assignees = await Promise.all(
      assigneeIds.map(async (id) => {
        const u = await ctx.runQuery(components.betterAuth.adapter.findOne, {
          model: "user",
          where: [{ field: "_id", value: id }],
        });
        return [id, u] as const;
      }),
    );
    const assigneeMap = new Map(assignees);

    return tasks.map((t) => ({
      ...t,
      board: boardMap.get(t.boardId) ?? null,
      assignee: t.assigneeId ? assigneeMap.get(t.assigneeId) ?? null : null,
    }));
  },
});
