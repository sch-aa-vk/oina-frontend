import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth";
import { isAxiosError } from "axios";

export function VerifyEmailForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const email = searchParams.get("email") ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.verifyEmail({ email, code });
      navigate("/login", { state: { verified: true } });
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Verification failed.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    setResendSuccess(false);
    try {
      await authService.resendVerificationCode(email);
      setResendSuccess(true);
    } catch {
      setError("Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="code">Verification Code</FieldLabel>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </Field>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {resendSuccess && (
              <p className="text-sm text-green-600">Code resent successfully!</p>
            )}

            <Field>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={resendLoading}
              >
                {resendLoading ? "Resending..." : "Resend Code"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
