import type {
  GiftRecord,
  StorageLike,
} from "../types/giftSite";

export function getStorageApi(): StorageLike | null {
  if (typeof window === "undefined") return null;
  const storageWindow = window as Window & { storage?: StorageLike };
  return storageWindow.storage || window.localStorage || null;
}

export function readAllGiftRecords(
  storageApi: StorageLike | null,
): GiftRecord[] {
  if (!storageApi) return [];

  const records: GiftRecord[] = [];
  const tryAddRecord = (key: string | null | undefined) => {
    if (!key || !String(key).startsWith("gift:")) return;
    try {
      const raw =
        typeof storageApi.getItem === "function"
          ? storageApi.getItem(key)
          : (storageApi[key] as string | undefined);
      if (!raw) return;
      const parsed = JSON.parse(raw) as GiftRecord;
      records.push(parsed);
    } catch {
      // Ignore malformed records
    }
  };

  if (
    typeof storageApi.length === "number" &&
    typeof storageApi.key === "function"
  ) {
    for (let i = 0; i < storageApi.length; i += 1) {
      tryAddRecord(storageApi.key(i));
    }
  } else {
    Object.keys(storageApi).forEach((key) => tryAddRecord(key));
  }

  return records.sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime(),
  );
}

export function compressImageFile(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.84,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Only image files are supported."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () =>
        reject(new Error(`Could not process ${file.name}.`));
      image.onload = () => {
        const scale = Math.min(
          1,
          maxWidth / image.width,
          maxHeight / image.height,
        );
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error(`Could not process ${file.name}.`));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };

      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

export function pickRandomTemplateId(
  ids: string[],
  fallbackId: string,
): string {
  if (!ids.length) return fallbackId;
  const index = Math.floor(Math.random() * ids.length);
  return ids[index] || fallbackId;
}

export const GEMINI_GENERATION_CONFIG = {
  temperature: 0.75,
  topP: 0.92,
  topK: 40,
  maxOutputTokens: 8192,

  thinkingConfig: {
    thinkingBudget: 8192,
  },
} as const;
