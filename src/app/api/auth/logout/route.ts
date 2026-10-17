import { clearSessionCookie, isSameOrigin } from "@/lib/auth/session";
import { jsonError } from "@/lib/security/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError(403, "Cross-site request blocked.");
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
}
