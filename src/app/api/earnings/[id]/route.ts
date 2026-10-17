import { z } from "zod";
import { userRoute } from "@/lib/api/route";
import { deleteEarning } from "@/lib/db/repo";
import { jsonError } from "@/lib/security/http";

export const DELETE = userRoute({}, async ({ user }, ctx: RouteContext<"/api/earnings/[id]">) => {
  const { id } = await ctx.params;
  if (!z.uuid().safeParse(id).success) return jsonError(400, "Invalid entry id.");
  const deleted = await deleteEarning(user.id, id);
  return deleted ? new Response(null, { status: 204 }) : jsonError(404, "Entry not found.");
});
