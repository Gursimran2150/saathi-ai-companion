import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { deleteEarning } from "@/lib/db/repo";
import { jsonError } from "@/lib/security/http";

export async function DELETE(request: Request, ctx: RouteContext<"/api/earnings/[id]">) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  if (!z.uuid().safeParse(id).success) return jsonError(400, "Invalid entry id.");
  const deleted = await deleteEarning(auth.user.id, id);
  return deleted ? new Response(null, { status: 204 }) : jsonError(404, "Entry not found.");
}
