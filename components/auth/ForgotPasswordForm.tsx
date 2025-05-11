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
import { AlertCircle, ArrowLeft, Loader2, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useI18n();

  // Define schema with localized error messages
  const formSchema = z.object({
    email: z.string().email(t("auth.email.invalid")),
  });

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(t("auth.forgot.error"));
      }

      setIsSubmitted(true);
      toast({
        title: t("auth.forgot.emailSent"),
        description: t("auth.forgot.checkInbox"),
      });
    } catch (error) {
      setErrorMessage(t("auth.forgot.error.server"));
      toast({
        title: t("auth.error"),
        description: t("auth.forgot.error.server"),
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
            <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{t("auth.forgot.emailSentConfirmation")}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("auth.forgot.checkInboxInstructions")}
        </p>
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => router.push("/login")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("auth.backToLogin")}
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("auth.email")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
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
              {t("auth.forgot.sending")}
            </div>
          ) : (
            t("auth.forgot.sendResetLink")
          )}
        </Button>

        <div className="mt-4 text-center">
          <Link
            href="/login"
            className="text-sm text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300">
            {t("auth.backToLogin")}
          </Link>
        </div>
      </form>
    </Form>
  );
}
