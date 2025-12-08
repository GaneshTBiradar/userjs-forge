import type { CSVOptions, DownloadOptions } from "./types";

/**
 * Save data to file
 */
function saveToFile(filename: string, data: string, extension = "txt"): void {
  const blob = new Blob([data], { type: `text/${extension};charset=utf-8;` });
  downloadBlob(blob, `${filename}.${extension}`);
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download with custom options
 */
function download(options: DownloadOptions): void {
  const { filename, data, mimeType = "text/plain;charset=utf-8" } = options;

  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Read file from input
 */
async function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Read file as ArrayBuffer
 */
async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Read file as Data URL
 */
async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Escape CSV value
 */
function escapeCsvValue(value: string, options: CSVOptions = {}): string {
  const { quote = '"', esc = '"' } = options;
  const escapedQuote = value.replace(new RegExp(quote, "g"), esc + quote);
  return `${quote}${escapedQuote}${quote}`;
}

/**
 * Convert array to CSV
 */
function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  options: CSVOptions = {},
): string {
  const { delimiter = ",", quote = '"', esc = '"', header = true } = options;

  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows: string[] = [];

  if (header) {
    rows.push(headers.map((h) => escapeCsvValue(h, { quote, esc })).join(delimiter));
  }

  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      const stringValue = value === null || value === undefined ? "" : String(value);
      return escapeCsvValue(stringValue, { quote, esc });
    });
    rows.push(values.join(delimiter));
  });

  return rows.join("\n");
}

/**
 * Parse CSV string
 */
function parseCSV(csv: string, options: CSVOptions = {}): string[][] {
  const { delimiter = ",", quote = '"' } = options;
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const nextChar = csv[i + 1];

    if (char === quote) {
      if (insideQuotes && nextChar === quote) {
        currentValue += quote;
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
    } else if (char === "\n" && !insideQuotes) {
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
    } else if (char === "\r" && nextChar === "\n" && !insideQuotes) {
      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      i++;
    } else {
      currentValue += char;
    }
  }

  if (currentValue || currentRow.length > 0) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Convert CSV to JSON
 */
function csvToJSON<T = Record<string, string>>(csv: string, options: CSVOptions = {}): T[] {
  const rows = parseCSV(csv, options);
  if (rows.length === 0) return [];

  const headers = rows[0];
  const data: T[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj: Record<string, string> = {};

    headers.forEach((header, index) => {
      obj[header] = row[index] || "";
    });

    data.push(obj as T);
  }

  return data;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Get file extension
 */
function getExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

/**
 * Get filename without extension
 */
function getFilenameWithoutExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

export {
  arrayToCSV,
  csvToJSON,
  download,
  downloadBlob,
  formatBytes,
  getExtension,
  getFilenameWithoutExtension,
  parseCSV,
  readFile,
  readFileAsArrayBuffer,
  readFileAsDataURL,
  saveToFile,
};

export type { CSVOptions, DownloadOptions };
