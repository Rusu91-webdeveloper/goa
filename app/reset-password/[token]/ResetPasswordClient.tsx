"use client";

import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { useI18n } from "@/lib/i18n/i18n-context";

interface ResetPasswordClientProps {
  token: string;
}

export default function ResetPasswordClient({
  token,
}: ResetPasswordClientProps) {
  const { t } = useI18n();

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
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
