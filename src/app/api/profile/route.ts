import { NO_STORE, userRoute } from "@/lib/api/route";
import { getProfile, saveProfile } from "@/lib/db/repo";
import { profileSchema } from "@/lib/profile";

export const GET = userRoute({}, async ({ user }) =>
  Response.json({ profile: await getProfile(user.id) }, { headers: NO_STORE }),
);

export const PUT = userRoute({ body: profileSchema }, async ({ user, body }) => {
  await saveProfile(user.id, body);
  return Response.json({ profile: body }, { headers: NO_STORE });
});
