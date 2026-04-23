export type ViewValue = "form" | "preview" | "published";

export interface ThemeOption {
  name: string;
  direction: string;
}

export interface TemplateOption {
  id: string;
  label: string;
  description: string;
  blueprint: string;
}

export interface VariationOption {
  id: string;
  label: string;
  description: string;
  blueprint: string;
}

export interface UploadedImage {
  id: string;
  name: string;
  dataUrl: string;
}

export interface GiftRecord {
  id: string;
  html: string;
  recipientName: string;
  occasion: string;
  createdAt: string;
}

export interface SparkleItem {
  id: number;
  left: string;
  size: string;
  delay: string;
  duration: string;
}

export interface ConfettiPiece {
  id: number;
  left: string;
  delay: string;
  hue: number;
  rotation: string;
}

export interface UiClasses {
  label: string;
  field: string;
  btnPrimary: string;
  btnGhost: string;
  btnSmGhost: string;
}

export interface BuildGiftPromptInput {
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

export interface StorageLike {
  length?: number;
  key?: (index: number) => string | null;
  getItem?: (key: string) => string | null;
  setItem?: (key: string, value: string) => void;
  [key: string]: unknown;
}
