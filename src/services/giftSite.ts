import axios from "axios";
import api from "./api";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export interface GenerateGiftRequest {
  recipientName: string;
  occasion: string;
  personalMessage: string;
  tone: string;
  themeName: string;
  themeDirection: string;
  templateLabel: string;
  templateBlueprint: string;
  variationLabel: string;
  variationBlueprint: string;
  variationDescription: string;
}

export interface GenerateGiftResponse {
  giftId: string;
}

export interface GetGiftResponse {
  status: "GENERATING" | "READY" | "ERROR";
  html?: string;
}

export const giftSiteService = {
  async generateGift(payload: GenerateGiftRequest): Promise<GenerateGiftResponse> {
    const response = await api.post<GenerateGiftResponse>("/gifts/generate", payload);
    return response.data;
  },

  async getGift(giftId: string): Promise<GetGiftResponse> {
    const response = await publicApi.get<{ data: GetGiftResponse }>(`/gifts/${giftId}`);
    return response.data.data;
  },
};
