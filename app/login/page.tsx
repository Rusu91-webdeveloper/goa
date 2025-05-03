import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="py-16 bg-background min-h-screen mt-12">
      <div className="container mx-auto px-4">
        <LoginForm />
      </div>
    </div>
  );
}
