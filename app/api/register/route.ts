import prisma from "@/lib/prisma";
import { signupSchema } from "@/lib/validation/zod";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validateData = signupSchema.parse(body);

    const { name, email, password } = validateData;

    const userExist = await prisma.user.findUnique({
      where: { email },
    });
    if (userExist) {
      return NextResponse.json(
        {
          error: "user already exist plz login to continue",
        },
        {
          status: 409,
        },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    return NextResponse.json(
      { message: "user created successfully", userId: user.id },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        {
          error: "validation error",
          details: formattedErrors,
        },
        {
          status: 400,
        },
      );
    }
    console.error("Signup error", error);
    return NextResponse.json(
      {
        message: "internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
