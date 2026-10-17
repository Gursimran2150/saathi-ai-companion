import { hashPassword } from "@/lib/auth/password";
import { signupSchema } from "@/lib/auth/schemas";
import { isSameOrigin, sessionCookie } from "@/lib/auth/session";
import { createUser } from "@/lib/db/repo";
import { enforceRateLimit } from "@/lib/ai/guard";
import { jsonError, parseJsonBody } from "@/lib/security/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError(403, "Cross-site request blocked.");
  const limited = enforceRateLimit(request);
  if (limited) return limited;

  const body = await parseJsonBody(request, signupSchema);
  if (!body.ok) return body.response;

  const user = await createUser({ ...body.data, passwordHash: await hashPassword(body.data.password) });
  if (!user) return jsonError(409, "An account with this email already exists. Please log in.");

  const session = { id: user.id, name: user.name, email: user.email, isDemo: false };
  return Response.json({ user: session }, { status: 201, headers: { "Set-Cookie": await sessionCookie(session) } });
}
