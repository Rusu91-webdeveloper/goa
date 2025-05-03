"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Das Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben und eine Zahl enthalten"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Die Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useI18n();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ein Fehler ist aufgetreten");
      }

      setIsSubmitted(true);
      toast({
        title: "Passwort zurückgesetzt",
        description:
          "Ihr Passwort wurde erfolgreich zurückgesetzt. Sie können sich jetzt anmelden.",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      );
      toast({
        title: "Fehler",
        description:
          "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-800 dark:text-green-300">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>Ihr Passwort wurde erfolgreich zurückgesetzt!</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
        </p>
        <Button
          className="mt-2"
          onClick={() => router.push("/login")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zum Login
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4">
        {errorMessage && (
          <Alert
            variant="destructive"
            className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Neues Passwort</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="bg-white dark:bg-gray-950"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passwort bestätigen</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="bg-white dark:bg-gray-950"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Wird gespeichert...
            </div>
          ) : (
            "Passwort zurücksetzen"
          )}
        </Button>
      </form>
    </Form>
  );
}
