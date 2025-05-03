import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passwort zurücksetzen | GOA Erwachsenenbildung",
  description:
    "Setzen Sie Ihr Passwort zurück und erhalten Sie Zugang zu Ihrem Konto.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="container py-16 md:py-24 w-full">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Passwort zurücksetzen
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link
            zum Zurücksetzen Ihres Passworts.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
