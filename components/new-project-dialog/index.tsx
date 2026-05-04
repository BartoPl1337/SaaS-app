"use client"

import * as React from "react"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { toast } from "sonner"

import { api } from "@/convex/_generated/api"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { StepIndicator } from "./step-indicator"
import { ProjectInformations } from "./project-informations"
import { ProjectTemplate } from "./project-template"
import { ProjectMembers } from "./project-members"
import { DialogFooter } from "./dialog-footer"
import type { InvitedMember } from "./types"

interface NewProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TOTAL_STEPS = 3
const TEMPLATES = ["kanban", "scrum", "list", "blank"] as const
type Template = (typeof TEMPLATES)[number]

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
  const router = useRouter()
  const createProject = useMutation(api.projects.create)

  const [step,        setStep]        = React.useState(1)
  const [name,        setName]        = React.useState("")
  const [description, setDescription] = React.useState("")
  const [accent,      setAccent]      = React.useState("violet")
  const [icon,        setIcon]        = React.useState("🚀")
  const [template,    setTemplate]    = React.useState<Template>("kanban")
  const [members,     setMembers]     = React.useState<InvitedMember[]>([])
  const [submitting,  setSubmitting]  = React.useState(false)

  const canNext =
    step === 1 ? name.trim().length > 0 :
    step === 2 ? !!template :
    true

  function resetState() {
    setStep(1)
    setName("")
    setDescription("")
    setAccent("violet")
    setIcon("🚀")
    setTemplate("kanban")
    setMembers([])
  }

  function handleClose() {
    onOpenChange(false)
    setTimeout(resetState, 300)
  }

  async function handleCreate() {
    if (submitting) return
    setSubmitting(true)
    try {
      const id = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        color: accent,
        icon,
        template,
      })
      toast.success("Projekt utworzony")
      handleClose()
      router.push(`/projects/${id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się utworzyć projektu")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-xl flex-col gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <div>
            <DialogTitle className="text-base font-semibold text-foreground">
              Nowy projekt
            </DialogTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Krok {step} z {TOTAL_STEPS}
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleClose} className="text-muted-foreground">
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex justify-center border-b border-border/50 px-6 py-4">
          <StepIndicator current={step} total={TOTAL_STEPS} />
        </div>

        <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: "60vh" }}>
          {step === 1 && (
            <ProjectInformations
              name={name} setName={setName}
              description={description} setDescription={setDescription}
              accent={accent} setAccent={setAccent}
              icon={icon} setIcon={setIcon}
            />
          )}
          {step === 2 && (
            <ProjectTemplate template={template} setTemplate={(v) => setTemplate(v as Template)} />
          )}
          {step === 3 && (
            <ProjectMembers members={members} setMembers={setMembers} />
          )}
        </div>

        <DialogFooter
          step={step}
          total={TOTAL_STEPS}
          canNext={canNext}
          submitting={submitting}
          onBack={() => step > 1 ? setStep(s => s - 1) : handleClose()}
          onNext={() => setStep(s => s + 1)}
          onCreate={handleCreate}
        />
      </DialogContent>
    </Dialog>
  )
}
