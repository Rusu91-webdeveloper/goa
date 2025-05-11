"use client";

import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function ForgotPasswordPage() {
  const { t } = useI18n();

  return (
    <div className="container py-16 md:py-24 w-full">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {t("auth.forgot.title")}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("auth.forgot.instruction")}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
