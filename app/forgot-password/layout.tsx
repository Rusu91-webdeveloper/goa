import { Metadata } from "next";
import { cookies } from "next/headers";

export const generateMetadata = async (): Promise<Metadata> => {
  // Get the language from cookies or default to 'de'
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "de";

  return {
    title:
      language === "de"
        ? "Passwort zurücksetzen | GOA Erwachsenenbildung"
        : "Reset Password | GOA Erwachsenenbildung",
    description:
      language === "de"
        ? "Setzen Sie Ihr Passwort zurück und erhalten Sie Zugang zu Ihrem Konto."
        : "Reset your password and regain access to your account.",
  };
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
