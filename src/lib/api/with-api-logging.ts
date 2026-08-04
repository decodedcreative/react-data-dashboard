export const REQUEST_ID_HEADER = 'x-request-id';
export type ApiRequestLog = {
  requestId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
};

export type ApiRequestLogger = (entry: ApiRequestLog) => void;

/**
 * Default sink: one JSON line on stdout.
 * In production this is what log shippers (CloudWatch, Datadog, Axiom) ingest.
 */
export const defaultApiRequestLogger: ApiRequestLogger = (entry) => {
  console.info(
    JSON.stringify({
      level: 'info',
      msg: 'api_request',
      ...entry,
    })
  );
};

type AppRouteHandler<TContext> = (
  request: Request,
  context: TContext
) => Response | Promise<Response>;

type WithApiLoggingOptions = {
  logger?: ApiRequestLogger;
  now?: () => number;
  createRequestId?: () => string;
};

function resolveRequestId(
  request: Request,
  createRequestId: () => string
): string {
  const incoming = request.headers.get(REQUEST_ID_HEADER)?.trim();
  return incoming || createRequestId();
}

function withRequestIdHeader(response: Response, requestId: string): Response {
  const headers = new Headers(response.headers);
  headers.set(REQUEST_ID_HEADER, requestId);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Wraps an App Router route handler so every response is timed and correlated.
 *
 * Why a wrapper (not Next.js `middleware.ts`)?
 * - Middleware runs at the edge *before* the route; it cannot see handler/DB time accurately.
 * - This wrapper measures the full server handler, including Prisma work.
 * - Edge middleware is a good *next* learning step for request IDs on page navigations.
 */
export function withApiLogging<TContext = unknown>(
  handler: AppRouteHandler<TContext>,
  options: WithApiLoggingOptions = {}
): AppRouteHandler<TContext> {
  const logger = options.logger ?? defaultApiRequestLogger;
  const now = options.now ?? Date.now;
  const createRequestId = options.createRequestId ?? (() => crypto.randomUUID());

  return async (request, context) => {
    const startedAt = now();
    const requestId = resolveRequestId(request, createRequestId);
    const method = request.method;
    const path = new URL(request.url).pathname;

    try {
      const response = await handler(request, context);
      const durationMs = now() - startedAt;

      logger({
        requestId,
        method,
        path,
        status: response.status,
        durationMs,
      });

      return withRequestIdHeader(response, requestId);
    } catch (error) {
      const durationMs = now() - startedAt;

      logger({
        requestId,
        method,
        path,
        status: 500,
        durationMs,
      });

      throw error;
    }
  };
}
