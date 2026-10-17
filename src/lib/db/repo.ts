import "server-only";
import { z } from "zod";
import {
  earningEntrySchema,
  extractedEarningSchema,
  type EarningEntry,
  type ExtractedEarning,
} from "@/lib/features/earnings";
import { DEFAULT_PROFILE, profileSchema, type Profile } from "@/lib/profile";
import { db } from "./client";

/**
 * All queries are parameterised tagged templates (no string-built SQL) and scoped by user id.
 * Rows are validated with zod on the way out, so the rest of the app never trusts raw DB shapes.
 */

const userRow = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  password_hash: z.string(),
  is_demo: z.boolean(),
});
type UserRow = z.infer<typeof userRow>;

const idRow = z.object({ id: z.string() });
const earningRow = z.object({ id: z.string(), data: z.record(z.string(), z.unknown()) });

const chatRow = z.object({
  id: z.coerce.number(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});
type ChatMessage = z.infer<typeof chatRow>;

/** Parses query results into typed rows (throws on schema drift instead of failing silently later). */
const rows = <S extends z.ZodType>(schema: S, result: unknown): z.infer<S>[] => z.array(schema).parse(result);

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const result = await db()`SELECT id, email, name, password_hash, is_demo FROM users WHERE email = ${email}`;
  return rows(userRow, result)[0] ?? null;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  isDemo?: boolean;
}): Promise<UserRow | null> {
  const result = await db()`
    INSERT INTO users (email, name, password_hash, is_demo)
    VALUES (${input.email}, ${input.name}, ${input.passwordHash}, ${input.isDemo ?? false})
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email, name, password_hash, is_demo`;
  return rows(userRow, result)[0] ?? null;
}

export async function getProfile(userId: string): Promise<Profile> {
  const [row] = rows(z.object({ data: z.unknown() }), await db()`SELECT data FROM profiles WHERE user_id = ${userId}`);
  const parsed = profileSchema.safeParse(row?.data);
  return parsed.success ? parsed.data : DEFAULT_PROFILE;
}

export async function saveProfile(userId: string, profile: Profile): Promise<void> {
  await db()`
    INSERT INTO profiles (user_id, data, updated_at) VALUES (${userId}, ${JSON.stringify(profile)}, now())
    ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`;
}

/** Newest first. `since` (YYYY-MM-DD) filters in SQL so only the needed rows leave the database. */
export async function listEarnings(userId: string, limit = 365, since = "0001-01-01"): Promise<EarningEntry[]> {
  const result = await db()`
    SELECT id, data FROM earnings WHERE user_id = ${userId} AND date >= ${since}::date
    ORDER BY date DESC, created_at DESC LIMIT ${limit}`;
  return rows(earningRow, result).flatMap((r) => {
    const parsed = earningEntrySchema.safeParse({ ...r.data, id: r.id });
    return parsed.success ? [parsed.data] : [];
  });
}

export async function addEarning(userId: string, entry: ExtractedEarning): Promise<EarningEntry> {
  const data = extractedEarningSchema.parse(entry);
  const [row] = rows(
    idRow,
    await db()`
    INSERT INTO earnings (user_id, date, data) VALUES (${userId}, ${data.date}, ${JSON.stringify(data)})
    RETURNING id`,
  );
  return { ...data, id: row.id };
}

export async function deleteEarning(userId: string, id: string): Promise<boolean> {
  const result = await db()`DELETE FROM earnings WHERE id = ${id} AND user_id = ${userId} RETURNING id`;
  return rows(idRow, result).length > 0;
}

export async function listChat(userId: string, limit = 40): Promise<ChatMessage[]> {
  const result = await db()`
    SELECT id, role, content FROM chat_messages WHERE user_id = ${userId}
    ORDER BY id DESC LIMIT ${limit}`;
  return rows(chatRow, result).reverse();
}

/** Inserts a whole turn in one round-trip (arrays are unnested server-side, order preserved). */
export async function addChatMessages(userId: string, messages: Pick<ChatMessage, "role" | "content">[]) {
  if (!messages.length) return;
  await db()`
    INSERT INTO chat_messages (user_id, role, content)
    SELECT ${userId}::uuid, r, c FROM unnest(${messages.map((m) => m.role)}::text[], ${messages.map((m) => m.content)}::text[])
      WITH ORDINALITY AS t(r, c, n) ORDER BY n`;
}

export async function clearChat(userId: string): Promise<void> {
  await db()`DELETE FROM chat_messages WHERE user_id = ${userId}`;
}
