"use client"
import { SignOutButton } from '@/components/sign-out-button';
import { authClient } from '@/lib/auth-client';

export default function Page() {
    const { data: session, isPending } = authClient.useSession();

    return (
        <div>
            <h1>Test</h1>
            {isPending ? (
                <p>Ładowanie...</p>
            ) : (
                <p className="text-sm">{JSON.stringify(session)}</p>
            )}
            <SignOutButton />
        </div>
    )
}