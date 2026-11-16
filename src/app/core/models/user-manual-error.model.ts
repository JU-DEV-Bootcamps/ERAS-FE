/** Error codes the manuals API returns in the body of a failed list or download. */
export const USER_MANUAL_ERROR_CODES = [
  'manuals_manifest_missing',
  'manuals_manifest_invalid',
  'manuals_file_missing',
  'manuals_not_found',
] as const;

export type UserManualErrorCode = (typeof USER_MANUAL_ERROR_CODES)[number];

/** A failed list or download of manuals; `code` is null when the response carried no known code. */
export class UserManualsApiError extends Error {
  constructor(readonly code: UserManualErrorCode | null) {
    super(code ?? 'user-manuals-error');
  }
}
