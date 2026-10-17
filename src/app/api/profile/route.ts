import { requireUser } from "@/lib/auth/session";
import { getProfile, saveProfile } from "@/lib/db/repo";
import { profileSchema } from "@/lib/profile";
import { parseJsonBody } from "@/lib/security/http";

const noStore = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  return Response.json({ profile: await getProfile(auth.user.id) }, { headers: noStore });
}

export async function PUT(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, profileSchema);
  if (!body.ok) return body.response;
  await saveProfile(auth.user.id, body.data);
  return Response.json({ profile: body.data }, { headers: noStore });
}
