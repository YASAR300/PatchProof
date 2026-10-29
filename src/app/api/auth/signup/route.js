import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(10, "Password must be at least 10 characters"),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.errors[0]?.message || "Invalid input data";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 400 }
      );
    }

    // Hash password with bcryptjs
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: "USER",
      },
    });

    // Write audit event
    try {
      await prisma.auditEvent.create({
        data: {
          actorId: user.id,
          action: "USER_SIGNED_UP",
          entityType: "User",
          entityId: user.id,
          metadata: { email: user.email, name: user.name },
        },
      });
    } catch (auditErr) {
      console.error("Failed to write signup audit event:", auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup handler error:", err);
    return NextResponse.json(
      { error: "A server error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
