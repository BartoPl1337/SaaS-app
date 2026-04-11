"use client"

import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    email: z
        .string()
        .email("Nieprawidłowy adres email"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
})
const SignInForm = () => {
    const router = useRouter();
    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            await authClient.signIn.email({
                email: value.email,
                password: value.password,
            },
                {
                    onSuccess: () => {
                        toast.success("Zalogowano pomyślnie")
                        form.reset()
                        router.push("/")
                        router.refresh()
                    },
                    onError: () => {
                        toast.error("Błąd podczas logowania")
                    }
                })
        },
    })
    return (
        <Card className="w-full sm:max-w-md">
            <CardContent className="flex flex-col gap-4">
                <form
                    id="bug-report-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >

                    <FieldGroup>
                        <form.Field
                            name="email"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name} className="font-semibold">Adres email</FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder="example@example.com"
                                            autoComplete="off"
                                            className="h-12"
                                        />
                                        {isInvalid && (
                                            <FieldError errors={field.state.meta.errors} />
                                        )}
                                    </Field>
                                )
                            }}
                        />
                        <form.Field
                            name="password"
                            children={(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name} className="font-semibold">Hasło</FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            placeholder="********"
                                            autoComplete="off"
                                            className="h-12"
                                            type="password"
                                        />
                                        {isInvalid && (
                                            <FieldError errors={field.state.meta.errors} />
                                        )}
                                    </Field>
                                )
                            }}
                        />
                    </FieldGroup>
                </form>
                <Field orientation="horizontal">
                    <Button type="submit" form="bug-report-form" className="w-full h-14">
                        Zaloguj się
                    </Button>
                </Field>
            </CardContent>
            <CardFooter className="flex justify-center mx-4 bg-white">
                <h3>
                    Nie masz konta? <Link href="/signUp" className="font-semibold text-orange-500">Zarejestruj się</Link>
                </h3>
            </CardFooter>
        </Card>
    )
}

export default SignInForm