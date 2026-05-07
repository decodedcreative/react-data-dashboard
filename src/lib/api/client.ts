export type ApiClientError = Error & { status: number };

function createApiClientError(message: string, status: number): ApiClientError {
  return Object.assign(new Error(message), {
    name: 'ApiClientError',
    status,
  });
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

  const payload: unknown = await response.json();
  return parse(payload);
}

