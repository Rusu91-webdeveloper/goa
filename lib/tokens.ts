import { randomBytes } from "crypto";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

const COLLECTION_NAME = "passwordResetTokens";

export async function createResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const client = await clientPromise;
  const db = client.db();

  await db.collection(COLLECTION_NAME).insertOne({
    token,
    userId: new ObjectId(userId),
    expires,
    createdAt: new Date(),
  });

  return token;
}

export async function validateResetToken(token: string): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db();

  const resetToken = await db.collection(COLLECTION_NAME).findOne({ token });

  if (!resetToken) {
    return false;
  }

  if (resetToken.expires < new Date()) {
    // Delete expired token
    await db.collection(COLLECTION_NAME).deleteOne({ _id: resetToken._id });
    return false;
  }

  return true;
}

export async function consumeResetToken(token: string): Promise<string | null> {
  const client = await clientPromise;
  const db = client.db();

  const resetToken = await db.collection(COLLECTION_NAME).findOne({ token });

  if (!resetToken || resetToken.expires < new Date()) {
    return null;
  }

  // Delete the token so it can't be used again
  await db.collection(COLLECTION_NAME).deleteOne({ _id: resetToken._id });

  return resetToken.userId.toString();
}
