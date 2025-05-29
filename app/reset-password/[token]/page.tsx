// This file should be a Server Component
import ResetPasswordClient from "./ResetPasswordClient";

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const token = params.token;

  return <ResetPasswordClient token={token} />;
}
