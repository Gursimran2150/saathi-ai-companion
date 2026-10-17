import { requireUser } from "@/lib/auth/session";
import { clearChat, listChat } from "@/lib/db/repo";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  return Response.json(
    { messages: await listChat(auth.user.id) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function DELETE(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  await clearChat(auth.user.id);
  return new Response(null, { status: 204 });
}
