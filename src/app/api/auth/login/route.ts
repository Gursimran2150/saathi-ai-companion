import { verifyPassword } from "@/lib/auth/password";
import { loginSchema } from "@/lib/auth/schemas";
import { isSameOrigin, sessionCookie } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/repo";
import { enforceRateLimit } from "@/lib/ai/guard";
import { jsonError, parseJsonBody } from "@/lib/security/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError(403, "Cross-site request blocked.");
  const limited = enforceRateLimit(request);
  if (limited) return limited;

  const body = await parseJsonBody(request, loginSchema);
  if (!body.ok) return body.response;

  const user = await findUserByEmail(body.data.email);
  // Same message for unknown email and wrong password, so accounts can't be enumerated.
  if (!user || !(await verifyPassword(body.data.password, user.password_hash))) {
    return jsonError(401, "Email or password is incorrect.");
  }
  const session = { id: user.id, name: user.name, email: user.email, isDemo: user.is_demo };
  return Response.json({ user: session }, { headers: { "Set-Cookie": await sessionCookie(session) } });
}
