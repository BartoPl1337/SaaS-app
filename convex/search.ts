import { v } from "convex/values";
import { query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";

export const global = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) return { projects: [], tasks: [] };

    const term = args.q.trim();
    if (term.length < 2) return { projects: [], tasks: [] };

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const allowedWorkspaceIds = new Set(memberships.map((m) => m.workspaceId));
    if (allowedWorkspaceIds.size === 0) return { projects: [], tasks: [] };

    const projectsRaw = await ctx.db
      .query("workspaces")
      .withSearchIndex("search_name", (q) => q.search("name", term))
      .take(20);
    const projects = projectsRaw
      .filter((w) => allowedWorkspaceIds.has(w._id))
      .slice(0, 5)
      .map((w) => ({
        _id: w._id,
        name: w.name,
        icon: w.icon,
        color: w.color,
      }));

    const tasksRaw = await ctx.db
      .query("tasks")
      .withSearchIndex("search_title", (q) => q.search("title", term))
      .take(40);

    const accessibleTasks: typeof tasksRaw = [];
    const boardCache = new Map<string, { workspaceId: string } | null>();
    for (const t of tasksRaw) {
      let board = boardCache.get(t.boardId);
      if (board === undefined) {
        const fetched = await ctx.db.get(t.boardId);
        board = fetched ? { workspaceId: fetched.workspaceId } : null;
        boardCache.set(t.boardId, board);
      }
      if (board && allowedWorkspaceIds.has(board.workspaceId as never)) {
        accessibleTasks.push(t);
        if (accessibleTasks.length >= 5) break;
      }
    }

    const tasks = await Promise.all(
      accessibleTasks.map(async (t) => {
        const board = await ctx.db.get(t.boardId);
        const workspace = board ? await ctx.db.get(board.workspaceId) : null;
        return {
          _id: t._id,
          title: t.title,
          status: t.status,
          workspaceId: workspace?._id ?? null,
          workspaceName: workspace?.name ?? null,
          workspaceIcon: workspace?.icon ?? null,
        };
      }),
    );

    return { projects, tasks };
  },
});
