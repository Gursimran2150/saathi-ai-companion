import { randomBytes } from "node:crypto";
import { publicRoute } from "@/lib/api/route";
import { hashPassword } from "@/lib/auth/password";
import { sessionCookie } from "@/lib/auth/session";
import { createUser } from "@/lib/db/repo";
import { jsonError } from "@/lib/security/http";

/** One-tap demo: creates a fresh, isolated demo account so evaluators never see each other's data. */
export const POST = publicRoute({ rateLimit: true }, async () => {
  const id = randomBytes(6).toString("hex");
  const user = await createUser({
    email: `demo-${id}@demo.saathi.app`,
    name: "Demo Worker",
    passwordHash: await hashPassword(randomBytes(24).toString("base64url")),
    isDemo: true,
  });
  if (!user) return jsonError(500, "Could not start a demo. Please try again.");

  const session = { id: user.id, name: user.name, email: user.email, isDemo: true };
  return Response.json({ user: session }, { status: 201, headers: { "Set-Cookie": await sessionCookie(session) } });
});
