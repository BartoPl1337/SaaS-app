export type Role = "Admin" | "Member" | "Viewer"

export interface InvitedMember {
  initials: string
  name: string
  color: string
  role: Role
}
