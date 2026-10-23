export interface ImportModalConfig {
  /** Dialog title */
  title: string;
  /** Accepted MIME type(s), e.g. 'text/csv' */
  acceptedMimeType: string;
  /** Human-readable file extension hint shown under the browse link, e.g. '(.csv)' */
  acceptedExtensionLabel: string;
  /** Max file size in bytes (default: 5 MB) */
  maxFileSizeBytes?: number;
  /** Description paragraph shown below the drop-zone */
  description?: string;
  /** Optional URL for a downloadable template */
  templateUrl?: string;
  /** Label for the template link (default: 'example template') */
  templateLabel?: string;
}

export interface ImportModalResult {
  file: File;
}
