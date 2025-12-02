import fs from "fs/promises";
import pdfjsLibCJS from "pdfjs-dist/legacy/build/pdf.js";
const { getDocument } = pdfjsLibCJS;

/**
 * Extract text from PDF file
 */
export async function extractTextFromPdf(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const dataUint8 = new Uint8Array(dataBuffer);

    const loadingTask = getDocument({ data: dataUint8 });
    const pdf = await loadingTask.promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      text += pageText + "\n\n";
    }

    return text.trim();
  } catch (err) {
    console.error("PDF parsing failed:", err);
    throw new Error("Failed to parse PDF: " + err.message);
  }
}
