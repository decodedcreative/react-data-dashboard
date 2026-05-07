export type ApiClientError = Error & { status: number };

function createApiClientError(message: string, status: number): ApiClientError {
  const error = new Error(message) as ApiClientError;
  error.name = 'ApiClientError';
  error.status = status;
  return error;
}

type ApiErrorShape = { error: string };

function isApiErrorShape(value: unknown): value is ApiErrorShape {
  if (typeof value !== 'object' || value === null) return false;
  if (!('error' in value)) return false;

  return typeof value.error === 'string';
}

export async function apiFetch<T>(
  input: RequestInfo | URL,
  parse: (payload: unknown) => T,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    let message = response.statusText || `Request failed with status ${response.status}`;

    try {
      const rawBody = await response.text();
      const trimmedBody = rawBody.trim();

      if (trimmedBody) {
        try {
          const payload: unknown = JSON.parse(trimmedBody);
          if (isApiErrorShape(payload)) {
            message = payload.error;
          } else {
            message = trimmedBody;
          }
        } catch {
          message = trimmedBody;
        }
      }
    } catch {
      // Fall back to statusText/default message when body is unreadable.
    }

    throw createApiClientError(message, response.status);
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch (error) {
    throw createApiClientError(
      error instanceof Error ? error.message : 'Response body is not valid JSON',
      response.status
    );
  }

  return parse(payload);
}

