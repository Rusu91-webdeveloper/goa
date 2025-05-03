import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { createResetToken } from "@/lib/tokens";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json(
        {
          message:
            "If an account exists, you will receive a password reset email",
        },
        { status: 200 }
      );
    }

    const resetToken = await createResetToken(user._id.toString());
    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json(
      {
        message:
          "If an account exists, you will receive a password reset email",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
