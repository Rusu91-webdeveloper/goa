"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage({
  params,
}: {
  params: { token: string };
}) {
  const router = useRouter();
  const { token } = params;
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(
            "Ihre E-Mail-Adresse wurde erfolgreich bestätigt. Sie können sich jetzt anmelden."
          );
        } else {
          setStatus("error");
          setMessage(
            data.message || "Der Bestätigungslink ist ungültig oder abgelaufen."
          );
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          "Bei der Bestätigung Ihrer E-Mail-Adresse ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut."
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              E-Mail-Bestätigung
            </h2>

            {status === "loading" && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
                <p className="mt-4 text-gray-600">
                  Ihre E-Mail-Adresse wird bestätigt...
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-16 w-16 text-violet-600 mb-4" />
                <p className="text-center text-gray-700 mb-6">{message}</p>
                <Link
                  href="/login"
                  className="bg-violet-600 text-white py-2 px-6 rounded-md font-medium hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">
                  Anmelden
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center justify-center py-8">
                <XCircle className="h-16 w-16 text-red-600 mb-4" />
                <p className="text-center text-gray-700 mb-6">{message}</p>
                <Link
                  href="/register"
                  className="bg-violet-600 text-white py-2 px-6 rounded-md font-medium hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">
                  Zurück zur Registrierung
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
