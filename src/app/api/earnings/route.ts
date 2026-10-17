import { NO_STORE, userRoute } from "@/lib/api/route";
import { addEarning, listEarnings } from "@/lib/db/repo";
import { extractedEarningSchema } from "@/lib/features/earnings";

export const GET = userRoute({}, async ({ user }) =>
  Response.json({ entries: await listEarnings(user.id) }, { headers: NO_STORE }),
);

export const POST = userRoute({ body: extractedEarningSchema }, async ({ user, body }) =>
  Response.json({ entry: await addEarning(user.id, body) }, { status: 201, headers: NO_STORE }),
);
