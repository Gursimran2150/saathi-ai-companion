import { requireUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  return Response.json({ user: auth.user }, { headers: { "Cache-Control": "private, no-store" } });
}
