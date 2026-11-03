export function getHttpErrorMessage(error: unknown, fallback: string): string {
  const body = (error as { error?: unknown } | null)?.error;

  if (typeof body === 'string' && body.trim().length > 0) return body;

  const title = (body as { title?: unknown } | null)?.title;
  return typeof title === 'string' && title.length > 0 ? title : fallback;
}
