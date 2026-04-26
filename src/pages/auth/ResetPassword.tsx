import { ResetPasswordForm } from "@/components/reset-password-form";

export default function ResetPassword() {
  return (
    <div className="flex w-full items-center justify-center p-6 md:p-10 min-h-[calc(100vh-3.5rem)]">
      <div className="w-full max-w-sm">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
