import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import SparkleField from "../components/giftsite/SparkleField";
import TopBar from "../components/giftsite/TopBar";
import SettingsPanel from "../components/giftsite/SettingsPanel";
import FormView from "../components/giftsite/views/FormView";
import PreviewView from "../components/giftsite/views/PreviewView";
import PublishedView from "../components/giftsite/views/PublishedView";
import {
  GEMINI_ENDPOINT,
  MAX_UPLOADED_IMAGES,
  THEMES,
  TEMPLATES,
  VALENTINE_TEMPLATE_IDS,
  VALENTINE_VARIATIONS,
  VIEW,
} from "../components/giftsite/constants/giftSiteCons";
import { UI_CLASSES } from "../components/giftsite/constants/uiClasses";
import type { GiftRecord, UploadedImage, ViewValue } from "../types/giftSite";
import {
  buildGiftPrompt,
  compressImageFile,
  ensureAdaptiveHtml,
  getStorageApi,
  injectUploadedImages,
  normalizeGeneratedHtml,
  randomGiftId,
  readAllGiftRecords,
} from "../utils/giftSiteUtil";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

export default function App() {
  const envApiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();
  const [view, setView] = useState<ViewValue>(VIEW.FORM);
  const [recipientName, setRecipientName] = useState("");
  const [occasion, setOccasion] = useState<string>("Birthday");
  const [personalMessage, setPersonalMessage] = useState("");
  const [tone, setTone] = useState<string>("Heartfelt");
  const [themeName, setThemeName] = useState(THEMES[0].name);
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [variationId, setVariationId] = useState(VALENTINE_VARIATIONS[0].id);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [showSettings] = useState(false);

  const [generatedHtml, setGeneratedHtml] = useState("");
  const [publishedLink, setPublishedLink] = useState("");
  const [myGifts, setMyGifts] = useState<GiftRecord[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "phone">(
    "desktop",
  );
  const [isImageProcessing, setIsImageProcessing] = useState(false);

  const activeApiKey = apiKey.trim() || envApiKey;
  const isValentineOccasion = occasion === "Valentine's Day";

  const selectedVariation =
    VALENTINE_VARIATIONS.find((variation) => variation.id === variationId) ||
    VALENTINE_VARIATIONS[0];
  const valentineTemplates = TEMPLATES.filter((template) =>
    VALENTINE_TEMPLATE_IDS.includes(
      template.id as (typeof VALENTINE_TEMPLATE_IDS)[number],
    ),
  );
  const nonValentineTemplates = TEMPLATES.filter(
    (template) =>
      !VALENTINE_TEMPLATE_IDS.includes(
        template.id as (typeof VALENTINE_TEMPLATE_IDS)[number],
      ),
  );
  const orderedTemplates = isValentineOccasion
    ? [...valentineTemplates, ...nonValentineTemplates]
    : TEMPLATES;
  const selectedTemplate =
    TEMPLATES.find((template) => template.id === templateId) || TEMPLATES[0];

  const storageApi = useMemo(() => getStorageApi(), []);
  const sparkles = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        size: `${6 + Math.random() * 8}px`,
        delay: `${Math.random() * 6}s`,
        duration: `${4 + Math.random() * 5}s`,
      })),
    [],
  );

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 48 }).map((_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.9}s`,
        hue: 28 + Math.round(Math.random() * 18),
        rotation: `${Math.round(Math.random() * 360)}deg`,
      })),
    [],
  );

  useEffect(() => {
    setMyGifts(readAllGiftRecords(storageApi));
  }, [storageApi]);

  useEffect(() => {
    if (!isValentineOccasion) return;
    if (
      VALENTINE_TEMPLATE_IDS.includes(
        templateId as (typeof VALENTINE_TEMPLATE_IDS)[number],
      )
    )
      return;
    setTemplateId(VALENTINE_TEMPLATE_IDS[0]);
  }, [isValentineOccasion, templateId]);

  useEffect(() => {
    if (!isValentineOccasion) return;
    if (VALENTINE_VARIATIONS.some((variation) => variation.id === variationId))
      return;
    setVariationId(VALENTINE_VARIATIONS[0].id);
  }, [isValentineOccasion, variationId]);

  const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const remainingSlots = MAX_UPLOADED_IMAGES - uploadedImages.length;
    if (remainingSlots <= 0) {
      setErrorMessage(`You can upload up to ${MAX_UPLOADED_IMAGES} images.`);
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setErrorMessage(`Only ${remainingSlots} more image(s) could be added.`);
    }

    setIsImageProcessing(true);
    try {
      const processed: UploadedImage[] = [];
      for (const file of selectedFiles) {
        const dataUrl = await compressImageFile(file);
        processed.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          dataUrl,
        });
      }

      if (processed.length) {
        setUploadedImages((previous) => [...previous, ...processed]);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Image upload failed. Please try another file.",
      );
    } finally {
      setIsImageProcessing(false);
    }
  };

  const removeUploadedImage = (id: string) => {
    setUploadedImages((previous) =>
      previous.filter((image) => image.id !== id),
    );
  };

  const generateGiftSite = async () => {
    setErrorMessage("");
    setCopied(false);

    if (!activeApiKey) {
      setErrorMessage(
        "Please set VITE_GEMINI_API_KEY in .env (or add a key in settings) before generating.",
      );
      return;
    }

    if (!recipientName.trim() || !personalMessage.trim()) {
      setErrorMessage(
        "Please fill in the recipient name and personal message first.",
      );
      return;
    }

    if (isImageProcessing) {
      setErrorMessage("Please wait for your images to finish processing.");
      return;
    }

    setIsLoading(true);

    try {
      const prompt = buildGiftPrompt({
        recipientName: recipientName.trim(),
        occasion,
        personalMessage: personalMessage.trim(),
        tone,
        themeName,
        themeDirection:
          THEMES.find((theme) => theme.name === themeName)?.direction ||
          THEMES[0].direction,
        templateLabel: selectedTemplate.label,
        templateBlueprint: selectedTemplate.blueprint,
        variationLabel: selectedVariation.label,
        variationBlueprint: selectedVariation.blueprint,
        variationDescription: selectedVariation.description,
      });

      const response = await fetch(
        `${GEMINI_ENDPOINT}?key=${encodeURIComponent(activeApiKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 1.0,
              maxOutputTokens: 8192,
            },
          }),
        },
      );

      const data = (await response.json()) as GeminiResponse;

      if (!response.ok) {
        const apiError =
          data?.error?.message ||
          "Gemini request failed. Please verify your API key and try again.";
        throw new Error(apiError);
      }

      const htmlText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!htmlText || typeof htmlText !== "string") {
        throw new Error(
          "Gemini returned an unexpected response. Please try regenerating.",
        );
      }

      const normalizedHtml = normalizeGeneratedHtml(htmlText);
      const adaptiveHtml = ensureAdaptiveHtml(normalizedHtml);
      const personalizedHtml = injectUploadedImages(
        adaptiveHtml,
        uploadedImages,
        recipientName.trim(),
        occasion,
      );
      setGeneratedHtml(personalizedHtml);
      setView(VIEW.PREVIEW);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating your gift page.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const publishGiftSite = () => {
    if (!generatedHtml) {
      setErrorMessage("Generate a gift site before publishing.");
      return;
    }

    const id = randomGiftId();
    const record: GiftRecord = {
      id,
      html: generatedHtml,
      recipientName: recipientName.trim(),
      occasion,
      createdAt: new Date().toISOString(),
    };

    if (storageApi) {
      try {
        const key = `gift:${id}`;
        const value = JSON.stringify(record);
        if (typeof storageApi.setItem === "function") {
          storageApi.setItem(key, value);
        } else {
          storageApi[key] = value;
        }
      } catch {
        setErrorMessage(
          "Gift was generated, but saving to storage failed in this browser.",
        );
      }
    }

    setPublishedLink(`https://giftsite.ai/g/${id}`);
    setMyGifts(readAllGiftRecords(storageApi));
    setView(VIEW.PUBLISHED);
  };

  const copyLink = async () => {
    if (!publishedLink) return;

    try {
      await navigator.clipboard.writeText(publishedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setErrorMessage(
        "Unable to copy automatically. You can still copy the link manually.",
      );
    }
  };

  return (
    <div className="relative w-full overflow-x-hidden">
      <SparkleField sparkles={sparkles} />

      <div className="relative z-10 mx-auto w-full max-w-6xl pb-8">
        <TopBar />

        {showSettings && (
          <SettingsPanel
            uiClasses={UI_CLASSES}
            apiKey={apiKey}
            envApiKey={envApiKey}
            onApiKeyChange={setApiKey}
          />
        )}

        {view === VIEW.FORM && (
          <FormView
            uiClasses={UI_CLASSES}
            recipientName={recipientName}
            setRecipientName={setRecipientName}
            occasion={occasion}
            setOccasion={setOccasion}
            personalMessage={personalMessage}
            setPersonalMessage={setPersonalMessage}
            uploadedImages={uploadedImages}
            isImageProcessing={isImageProcessing}
            handleImageSelection={handleImageSelection}
            removeUploadedImage={removeUploadedImage}
            tone={tone}
            setTone={setTone}
            themeName={themeName}
            setThemeName={setThemeName}
            templateId={templateId}
            setTemplateId={setTemplateId}
            orderedTemplates={orderedTemplates}
            isValentineOccasion={isValentineOccasion}
            valentineTemplates={valentineTemplates}
            selectedTemplate={selectedTemplate}
            variationId={variationId}
            setVariationId={setVariationId}
            selectedVariation={selectedVariation}
            isLoading={isLoading}
            generateGiftSite={generateGiftSite}
            errorMessage={errorMessage}
          />
        )}

        {view === VIEW.PREVIEW && (
          <PreviewView
            uiClasses={UI_CLASSES}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            generatedHtml={generatedHtml}
            publishGiftSite={publishGiftSite}
            generateGiftSite={generateGiftSite}
            isLoading={isLoading}
            setView={setView}
            formView={VIEW.FORM}
            errorMessage={errorMessage}
          />
        )}

        {view === VIEW.PUBLISHED && (
          <PublishedView
            uiClasses={UI_CLASSES}
            confettiPieces={confettiPieces}
            publishedLink={publishedLink}
            copied={copied}
            copyLink={copyLink}
            setView={setView}
            formView={VIEW.FORM}
            myGifts={myGifts}
            errorMessage={errorMessage}
          />
        )}
      </div>
    </div>
  );
}
