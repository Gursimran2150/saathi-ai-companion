import { NO_STORE, userRoute } from "@/lib/api/route";
import { clearChat, listChat } from "@/lib/db/repo";

export const GET = userRoute({}, async ({ user }) =>
  Response.json({ messages: await listChat(user.id) }, { headers: NO_STORE }),
);

export const DELETE = userRoute({}, async ({ user }) => {
  await clearChat(user.id);
  return new Response(null, { status: 204 });
});
