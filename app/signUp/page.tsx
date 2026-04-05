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
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useMutation } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  name: z.string().min(1, "Imię jest wymagane"),
  surname: z.string().min(1, "Nazwisko jest wymagane"),
  email: z
    .string()
    .email("Nieprawidłowy adres email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  acceptTerms: z.boolean().refine((val) => val, {
    message: "Musisz zaakceptować warunki i politykę prywatności",
  }),
})

export default function Page() {
  const router = useRouter();
  const register = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await authClient.signUp.email({
        email: data.email,
        name: data.name,
        password: data.password,
        surname: data.surname,
      })
    },
    onSuccess: () => {
      toast.success("Konto zostało utworzone")
      form.reset()
      router.push("/login")
      router.refresh()
    },
    onError: () => {
      toast.error("Błąd podczas tworzenia konta")
    }
  })
  const form = useForm({
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
      acceptTerms: false,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      register.mutate(
        value
      )
    }
  })
  return (
    <div className="container mx-auto flex flex-col justify-center items-center gap-10 h-screen">
      <div className="flex flex-col gap-4 text-center max-w-md">
        <h1 className="text-6xl font-semibold">Utwórz konto</h1>
        <p className="text-balance">Zacznij projektować przyszłość z najbardziej zaawansowanym systemem projektowania</p>
      </div>
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
              <div className="grid grid-cols-2 gap-4">
                <form.Field
                  name="name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name} className="font-semibold">Imię</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Jan"
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
                  name="surname"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name} className="font-semibold">Nazwisko</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Kowalski"
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
              </div>
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
                        type="email"
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
                        type="password"
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
                name="acceptTerms"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid} orientation="horizontal">
                      <Checkbox
                        id={field.name}
                        name={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked: boolean) =>
                          field.handleChange(checked)
                        }
                      />
                      <FieldLabel
                        htmlFor={field.name}
                        className="font-normal"
                      >
                        Akceptuj regulamin serwisu oraz politykę prywatności
                      </FieldLabel>
                    </Field>
                  )
                }}
              />
            </FieldGroup>
          </form>
          <Field orientation="horizontal">
            <Button type="submit" form="bug-report-form" className="w-full h-14">
              Zarejestruj się
            </Button>
          </Field>
        </CardContent>
        <CardFooter className="flex justify-center mx-4 bg-white">
          <h3>
            Masz już konto? <Link href="/login">Zaloguj się</Link>
          </h3>
        </CardFooter>
      </Card>
    </div>
  )
}
