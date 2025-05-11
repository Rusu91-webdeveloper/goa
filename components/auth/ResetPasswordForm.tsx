"use client";

import { useState, useEffect } from "react";
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

// Updated Zod schema to use translation function for messages
const getFormSchema = (t: Function) =>
  z
    .object({
      password: z
        .string()
        .min(
          8,
          t("auth.resetPassword.passwordTooShort") ||
            "Password must be at least 8 characters long"
        )
        // Keeping regex for now, but ideally this message would also be translated if more complex
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          t("auth.password.complexity") ||
            "Password must contain an uppercase letter, a lowercase letter, and a number."
        ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message:
        t("auth.resetPassword.passwordMismatch") ||
        "The passwords do not match.",
      path: ["confirmPassword"],
    });

type FormData = z.infer<ReturnType<typeof getFormSchema>>;

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useI18n();

  const formSchema = getFormSchema(t);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Effect to reset form validation state if language changes, as Zod messages might change
  useEffect(() => {
    // This will clear previous validation errors that might have been in a different language
    // and re-evaluate with the new language's Zod messages if a submission is attempted.
    // If you want to clear field values as well, you can use form.reset().
    form.clearErrors();
  }, [language, form]);

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
        const apiErrorMessage = errorData.translationKey
          ? t(errorData.translationKey)
          : errorData.message;
        throw new Error(
          apiErrorMessage ||
            t("auth.forgot.error.server") ||
            "An error occurred."
        );
      }

      setIsSubmitted(true);
      toast({
        title: t("auth.resetPassword.successTitle") || "Password Reset",
        description:
          t("auth.resetPassword.successMessage") ||
          "Your password has been reset successfully. You can now log in.",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t("auth.forgot.error.server") ||
              "An error occurred. Please try again later."
      );
      toast({
        title: t("auth.resetPassword.errorTitle") || "Error",
        description:
          error instanceof Error
            ? error.message
            : t("auth.forgot.error.server") ||
              "An error occurred. Please try again later.",
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
            <p>
              {t("auth.resetPassword.successTitle") ||
                "Password reset successfully!"}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("auth.resetPassword.successMessage") ||
            "You can now log in with your new password."}
        </p>
        <Button
          className="mt-2"
          onClick={() => router.push("/login")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("auth.resetPassword.backToLogin") || "Back to Login"}
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
              <FormLabel>
                {t("auth.resetPassword.newPassword") || "New Password"}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder={
                    t("auth.resetPassword.newPasswordPlaceholder") || "••••••••"
                  }
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
              <FormLabel>
                {t("auth.resetPassword.confirmNewPassword") ||
                  "Confirm New Password"}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder={
                    t("auth.resetPassword.confirmPasswordPlaceholder") ||
                    "••••••••"
                  }
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
              {t("auth.resetPassword.submittingButton") || "Setting..."}
            </div>
          ) : (
            t("auth.resetPassword.submitButton") || "Set Password"
          )}
        </Button>
      </form>
    </Form>
  );
}
