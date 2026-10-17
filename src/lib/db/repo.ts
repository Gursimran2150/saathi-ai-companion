import "server-only";
import {
  earningEntrySchema,
  extractedEarningSchema,
  type EarningEntry,
  type ExtractedEarning,
} from "@/lib/features/earnings";
import { DEFAULT_PROFILE, profileSchema, type Profile } from "@/lib/profile";
import { db } from "./client";

/** All queries are parameterised tagged templates (no string-built SQL) and scoped by user id. */

export interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  is_demo: boolean;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const rows =
    (await db()`SELECT id, email, name, password_hash, is_demo FROM users WHERE email = ${email}`) as UserRow[];
  return rows[0] ?? null;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  isDemo?: boolean;
}): Promise<UserRow | null> {
  const rows = (await db()`
    INSERT INTO users (email, name, password_hash, is_demo)
    VALUES (${input.email}, ${input.name}, ${input.passwordHash}, ${input.isDemo ?? false})
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email, name, password_hash, is_demo`) as UserRow[];
  return rows[0] ?? null;
}

export async function getProfile(userId: string): Promise<Profile> {
  const rows = (await db()`SELECT data FROM profiles WHERE user_id = ${userId}`) as { data: unknown }[];
  const parsed = profileSchema.safeParse(rows[0]?.data);
  return parsed.success ? parsed.data : DEFAULT_PROFILE;
}

export async function saveProfile(userId: string, profile: Profile): Promise<void> {
  await db()`
    INSERT INTO profiles (user_id, data, updated_at) VALUES (${userId}, ${JSON.stringify(profile)}, now())
    ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`;
}

export async function listEarnings(userId: string, limit = 365): Promise<EarningEntry[]> {
  const rows = (await db()`
    SELECT id, data FROM earnings WHERE user_id = ${userId}
    ORDER BY date DESC, created_at DESC LIMIT ${limit}`) as { id: string; data: unknown }[];
  return rows.flatMap((r) => {
    const parsed = earningEntrySchema.safeParse({ ...(r.data as object), id: r.id });
    return parsed.success ? [parsed.data] : [];
  });
}

export async function addEarning(userId: string, entry: ExtractedEarning): Promise<EarningEntry> {
  const data = extractedEarningSchema.parse(entry);
  const rows = (await db()`
    INSERT INTO earnings (user_id, date, data) VALUES (${userId}, ${data.date}, ${JSON.stringify(data)})
    RETURNING id`) as { id: string }[];
  return { ...data, id: rows[0].id };
}

export async function deleteEarning(userId: string, id: string): Promise<boolean> {
  const rows = (await db()`DELETE FROM earnings WHERE id = ${id} AND user_id = ${userId} RETURNING id`) as unknown[];
  return rows.length > 0;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export async function listChat(userId: string, limit = 40): Promise<ChatMessage[]> {
  const rows = (await db()`
    SELECT id, role, content FROM chat_messages WHERE user_id = ${userId}
    ORDER BY id DESC LIMIT ${limit}`) as ChatMessage[];
  return rows.reverse().map((r) => ({ ...r, id: Number(r.id) }));
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
