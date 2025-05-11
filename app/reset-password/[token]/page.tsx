"use client"; // Required for useI18n hook

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { useI18n } from "@/lib/i18n/i18n-context"; // Import the hook
// Metadata cannot be dynamic in client components in this way directly for the page title shown in browser tab.
// We will handle dynamic metadata for the page title in a different way if needed, or set a generic one.
// For now, let's focus on the visible content on the page.

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { t } = useI18n(); // Initialize the hook

  return (
    <div className="container py-16 md:py-24 w-full">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {t("auth.resetPassword.title") || "Set New Password"}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("auth.resetPassword.description") ||
              "Create a new, secure password for your account."}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm">
          <ResetPasswordForm token={params.token} />
        </div>
      </div>
    </div>
  );
}
