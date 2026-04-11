import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { Separator } from "../ui/separator"

export default function ProjectInformations() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full gap-1.5 border-dashed text-xs font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer"
                >
                    <Plus className="size-3.5" />
                    Nowy projekt
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Nowy projekt</DialogTitle>
                    <DialogDescription>
                        Krok 1 z 3
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center">
                    <p className="border rounded-full px-4 py-2.5">1</p>
                    <span className="h-2 w-20 bg-red-500" />
                    <p className="border rounded-full px-4 py-2.5">2</p>
                    <p className="border rounded-full px-4 py-2.5">3</p>
                </div>
                <FieldGroup>
                    <Field>
                        <Label htmlFor="name-1">Name</Label>
                        <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                    </Field>
                    <Field>
                        <Label htmlFor="username-1">Username</Label>
                        <Input id="username-1" name="username" defaultValue="@peduarte" />
                    </Field>
                </FieldGroup>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
