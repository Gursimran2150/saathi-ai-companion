import { requireUser } from "@/lib/auth/session";
import { addEarning, listEarnings } from "@/lib/db/repo";
import { extractedEarningSchema } from "@/lib/features/earnings";
import { parseJsonBody } from "@/lib/security/http";

const noStore = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  return Response.json({ entries: await listEarnings(auth.user.id) }, { headers: noStore });
}

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const body = await parseJsonBody(request, extractedEarningSchema);
  if (!body.ok) return body.response;
  return Response.json({ entry: await addEarning(auth.user.id, body.data) }, { status: 201, headers: noStore });
}
