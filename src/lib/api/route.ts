import "server-only";
import type { z } from "zod";
import { enforceRateLimit } from "@/lib/ai/guard";
import { isSameOrigin, requireUser } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/token";
import { jsonError, parseJsonBody } from "@/lib/security/http";

/**
 * Route-handler wrappers that apply the cross-cutting checks in one fixed order:
 * same-origin (CSRF) → session → rate limit → body validation → handler,
 * plus a catch-all that logs server-side and never leaks internals.
 */

interface RouteOptions<B> {
  /** Validate the JSON body with this schema; the parsed value is passed as `body`. */
  body?: z.ZodType<B>;
  /** Apply the per-user (or per-IP when logged out) rate limit. */
  rateLimit?: boolean;
}

interface PublicContext<B> {
  request: Request;
  body: B;
}

interface UserContext<B> extends PublicContext<B> {
  user: SessionUser;
}

type Handler<C, P> = (ctx: C, params: P) => Promise<Response> | Response;

async function finish<B>(
  request: Request,
  options: RouteOptions<B>,
  userId: string | undefined,
  run: (body: B) => Promise<Response> | Response,
): Promise<Response> {
  if (options.rateLimit) {
    const limited = enforceRateLimit(request, userId);
    if (limited) return limited;
  }
  let body = undefined as B;
  if (options.body) {
    const parsed = await parseJsonBody(request, options.body);
    if (!parsed.ok) return parsed.response;
    body = parsed.data;
  }
  try {
    return await run(body);
  } catch (error) {
    console.error("[api]", error);
    return jsonError(500, "Something went wrong. Please try again.");
  }
}

/** For endpoints that work without a session (login, signup, demo, logout). */
export function publicRoute<B = undefined, P = unknown>(
  options: RouteOptions<B>,
  handler: Handler<PublicContext<B>, P>,
) {
  return async (request: Request, params?: P): Promise<Response> => {
    if (request.method !== "GET" && !isSameOrigin(request)) return jsonError(403, "Cross-site request blocked.");
    return finish(request, options, undefined, (body) => handler({ request, body }, params as P));
  };
}

/** For endpoints that need the logged-in user; the handler only ever sees that user's id. */
export function userRoute<B = undefined, P = unknown>(options: RouteOptions<B>, handler: Handler<UserContext<B>, P>) {
  return async (request: Request, params?: P): Promise<Response> => {
    const auth = await requireUser(request);
    if (!auth.ok) return auth.response;
    return finish(request, options, auth.user.id, (body) => handler({ request, body, user: auth.user }, params as P));
  };
}

export const NO_STORE = { "Cache-Control": "private, no-store" } as const;
