import SignInForm from "@/components/forms/signIn-form";
import { isAuthenticated } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function Page() {
    const authenticated = await isAuthenticated();
    if (authenticated) {
        redirect("/");
    }
    return (
        <div className="container mx-auto flex flex-col justify-center items-center gap-10 h-screen">
            <div className="flex flex-col gap-4 text-center max-w-md">
                <h1 className="text-6xl font-semibold">Zaloguj się</h1>
                <p className="text-balance">Zacznij projektować przyszłość z najbardziej zaawansowanym systemem projektowania</p>
            </div>
            <SignInForm />
        </div>
    )
}
