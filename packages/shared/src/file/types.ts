export interface DownloadOptions {
  filename: string;
  data: string | Blob;
  mimeType?: string;
}

export interface CSVOptions {
  delimiter?: string;
  quote?: string;
  esc?: string;
  header?: boolean;
}
