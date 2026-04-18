import axios from "axios";
import api from "./api";
import type { User } from "@/types/auth";

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  username?: string;
}

export interface AvatarUploadResponse {
  presignedUrl: string;
  avatarUrl: string;
}

export type AvatarContentType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

type ApiErrorPayload = {
  message?: string;
  errorCode?: string;
  code?: string;
  error?: { code?: string };
};

const ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: "User not found.",
  USERNAME_TAKEN: "This username is already taken.",
  VALIDATION_ERROR: "Please check the entered values.",
};

function extractError(error: unknown): { message: string; code?: string; status?: number } {
  if (!axios.isAxiosError(error)) {
    return { message: "Something went wrong. Please try again." };
  }
  const status = error.response?.status;
  const payload = error.response?.data as ApiErrorPayload | undefined;
  const code = payload?.errorCode ?? payload?.code ?? payload?.error?.code;
  const backendMessage = payload?.message ?? error.message;

  if (status === 401) {
    return { status, code, message: "Your session expired. Please sign in again." };
  }

  return {
    status,
    code,
    message: (code ? ERROR_MESSAGES[code] : undefined) ?? backendMessage ?? "Something went wrong. Please try again.",
  };
}

export const usersService = {
  async getMe(): Promise<User> {
    const response = await api.get<User>("/users/me");
    return response.data;
  },

  async updateMe(patch: UpdateProfileRequest): Promise<User> {
    const response = await api.patch<User>("/users/me", patch);
    return response.data;
  },

  async uploadAvatar(contentType: AvatarContentType): Promise<AvatarUploadResponse> {
    const response = await api.post<AvatarUploadResponse>("/users/me/avatar", { contentType });
    return response.data;
  },

  async putFileToS3(presignedUrl: string, file: File): Promise<void> {
    await axios.put(presignedUrl, file, {
      headers: { "Content-Type": file.type },
    });
  },

  mapError(error: unknown) {
    return extractError(error);
  },
};
