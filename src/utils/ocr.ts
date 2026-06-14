/**
 * OCR Utility - Document Intelligence
 * Uses Tesseract.js for client-side OCR on scanned medical forms.
 */
import Tesseract from "tesseract.js";

export interface OcrProgress {
  status: string;
  progress: number;
}

export interface OcrResult {
  text: string;
  confidence: number;
  lines: { text: string; confidence: number }[];
}

/**
 * Perform OCR on an image file (JPEG, PNG, etc.)
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<OcrResult> {
  const result = await Tesseract.recognize(file, "eng", {
    logger: (m) => {
      if (onProgress && m.status && typeof m.progress === "number") {
        onProgress({
          status: m.status,
          progress: Math.round(m.progress * 100),
        });
      }
    },
  });

  const text = result.data.text;
  const confidence = result.data.confidence;

  // Split text into lines with uniform confidence
  const lines = text
    .split("\n")
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0)
    .map((line: string) => ({ text: line, confidence }));

  return { text, confidence, lines };
}

/**
 * Auto-detect file type and extract text accordingly.
 * For PDF files, Tesseract.js handles them the same way as images.
 */
export async function extractText(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<OcrResult> {
  return extractTextFromImage(file, onProgress);
}
