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
    let message = `Request failed with status ${response.status}`;

    try {
      const payload: unknown = await response.json();
      if (isApiErrorShape(payload)) message = payload.error;
    } catch {
      try {
        const fallbackText = await response.text();
        const trimmed = fallbackText.trim();
        if (trimmed) message = trimmed;
      } catch {
        if (response.statusText) message = response.statusText;
      }
    }

    throw createApiClientError(message, response.status);
  }

  const payload: unknown = await response.json();
  return parse(payload);
}

