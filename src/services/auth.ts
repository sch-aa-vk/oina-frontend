import api from "./api";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  TokenResponse,
  ValidateTokenResponse,
  VerifyEmailRequest,
} from "@/types/auth";

export const authService = {
  register(data: RegisterRequest) {
    return api.post("/auth/register", data);
  },

  verifyEmail(data: VerifyEmailRequest) {
    return api.post("/auth/verify-email", data);
  },

  resendVerificationCode(email: string) {
    return api.post("/auth/resend-verification-code", { email });
  },

  login(data: LoginRequest) {
    return api.post<LoginResponse>("/auth/login", data);
  },

  logout() {
    return api.post("/auth/logout");
  },

  refreshToken(refreshToken: string) {
    return api.post<TokenResponse>("/auth/refresh-token", { refreshToken });
  },

  forgotPassword(email: string) {
    return api.post("/auth/forgot-password", { email });
  },

  resetPassword(data: ResetPasswordRequest) {
    return api.post("/auth/reset-password", data);
  },

  validateToken() {
    return api.post<ValidateTokenResponse>("/auth/validate-token");
  },
};
