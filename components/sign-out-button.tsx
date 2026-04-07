"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
    const router = useRouter()

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/signIn")
                    router.refresh()
                },
            },
        })
    }

    return (
        <Button variant="outline" onClick={handleSignOut}>
            Wyloguj się
        </Button>
    )
}
