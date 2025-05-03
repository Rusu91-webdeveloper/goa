import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neues Passwort festlegen | GOA Erwachsenenbildung",
  description: "Erstellen Sie ein neues Passwort für Ihr Konto.",
};

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  return (
    <div className="container py-16 md:py-24 w-full">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Neues Passwort festlegen
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Erstellen Sie ein neues, sicheres Passwort für Ihr Konto.
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm">
          <ResetPasswordForm token={params.token} />
        </div>
      </div>
    </div>
  );
}
