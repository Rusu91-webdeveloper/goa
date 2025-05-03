import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import clientPromise from "./db";
import type { User } from "@/models/User";
import type { RequestCookies } from "next/dist/server/web/spec-extension/cookies";

// In a real app, these would be environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const COOKIE_NAME = "goa_auth_token";

// Cookie settings
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword);
}

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return sign(payload, JWT_SECRET);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const client = await clientPromise;
  const db = client.db();

  const user = await db.collection("users").findOne({ email });
  return user as User | null;
}

export async function getUserById(id: string): Promise<User | null> {
  const client = await clientPromise;
  const db = client.db();

  try {
    const objectId = new ObjectId(id);
    const user = await db.collection("users").findOne({ _id: objectId });
    return user as User | null;
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
}

export function getAuthCookie(): string | undefined {
  try {
    const cookieStore = cookies() as unknown as RequestCookies;
    return cookieStore.get(COOKIE_NAME)?.value;
  } catch (error) {
    console.error("Error getting auth cookie:", error);
    return undefined;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = getAuthCookie();

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return null;
    }

    return await getUserById(decoded.id);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
