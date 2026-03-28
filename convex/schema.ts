import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { tables as authSchema } from "./betterAuth/schema";

export default defineSchema({
  ...authSchema,
  workspaces: defineTable({
    name: v.string(),
    ownerId: v.id("user"),
  }),
  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("user"),
    role: v.union(v.literal("owner"), v.literal("member"), v.literal("viewer")),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_workspace_user", ["workspaceId", "userId"]),
  boards: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    createdBy: v.id("user"),
  })
    .index("by_workspace", ["workspaceId"]),
  tasks: defineTable({
    boardId: v.id("boards"),
    assigneeId: v.optional(v.id("user")),
    createdBy: v.id("user"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    status: v.union(
      v.literal("todo"),
      v.literal("inprogress"),
      v.literal("review"),
      v.literal("done"),
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    ),
    order: v.number(),
    updatedAt: v.number(),
  })
    .index("by_board", ["boardId"])
    .index("by_board_status", ["boardId", "status"])
    .index("by_assignee", ["assigneeId"]),
  comments: defineTable({
    taskId: v.id("tasks"),
    userId: v.id("user"),
    content: v.string(),
  })
    .index("by_task", ["taskId"]),
  activity: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("user"),
    type: v.union(
      v.literal("TASK_CREATED"),
      v.literal("TASK_COMMENTED"),
      v.literal("TASK_COMPLETED"),
      v.literal("TASK_MOVED"),
      v.literal("TASK_ASSIGNED"),
      v.literal("TASK_EDITED"),
      v.literal("TASK_ATTACHED"),
      v.literal("TASK_DELETED"),
      v.literal("BOARD_CREATED"),
      v.literal("BOARD_EDITED"),
      v.literal("BOARD_DELETED"),
    ),
    entityId: v.string(),
    entityType: v.union(
      v.literal("workspace"),
      v.literal("board"),
      v.literal("task"),
      v.literal("comment"),
    ),
    metadata: v.optional(v.any()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"]),
  attachments: defineTable({
    taskId: v.id("tasks"),
    uploadedBy: v.id("user"),
    fileUrl: v.optional(v.string()),
  })
    .index("by_task", ["taskId"]),
  labels: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    color: v.string(),
  })
    .index("by_workspace", ["workspaceId"]),
  taskLabels: defineTable({
    taskId: v.id("tasks"),
    labelId: v.id("labels"),
  })
    .index("by_task", ["taskId"])
    .index("by_label", ["labelId"]),
});
