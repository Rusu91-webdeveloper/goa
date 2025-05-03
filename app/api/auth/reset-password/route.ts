import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";
import { consumeResetToken } from "@/lib/tokens";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    const userId = await consumeResetToken(token);
    if (!userId) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Hash the new password
    const hashedPassword = await hash(password, 12);

    // Update the user's password
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
