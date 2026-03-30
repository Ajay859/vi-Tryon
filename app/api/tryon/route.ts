import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { prompt } from "@/lib/prompt";
import { tryOnRequestSchema } from "@/lib/validation/tryonSchema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const GenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type GeminiPart = {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login first." },
        { status: 401 },
      );
    }

    const formData = await req.formData();

    // ✅ FIXED NAME
    const usePreviousUserPhoto =
      formData.get("usePreviousUserPhoto") === "true";

    const userPhotoFile = formData.get("userPhoto") as File | null;
    const clothPhotoFile = formData.get("clothPhoto") as File | null;

    const validation = tryOnRequestSchema.safeParse({
      usePreviousUserPhoto,
      userPhoto: userPhotoFile || undefined,
      clothPhoto: clothPhotoFile,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    let userPhotoToUse = userPhotoFile;

    // ✅ FIXED Prisma field
    if (usePreviousUserPhoto) {
      const userData = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { userPhotourl: true },
      });

      if (!userData?.userPhotourl) {
        return NextResponse.json(
          {
            success: false,
            error: "No previous photo found. Please upload one.",
          },
          { status: 400 },
        );
      }

      const res = await fetch(userData.userPhotourl);
      const buffer = await res.arrayBuffer();

      userPhotoToUse = new File([buffer], "previous.jpg", {
        type: "image/jpeg",
      });
    }

    if (!userPhotoToUse || !clothPhotoFile) {
      return NextResponse.json(
        {
          success: false,
          error: "User photo and cloth photo are required",
        },
        { status: 400 },
      );
    }

    // 1. Convert to Buffers (Ensuring names are consistent)
    const userBuffer = Buffer.from(await userPhotoToUse.arrayBuffer());
    const clothBuffer = Buffer.from(await clothPhotoFile.arrayBuffer());

    const model = GenAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
    });

    // 2. Build the parts list (Images FIRST, Text LAST)
    const parts: any[] = [
      {
        inlineData: {
          mimeType: userPhotoToUse.type,
          data: userBuffer.toString("base64"),
        },
      },
      {
        inlineData: {
          mimeType: clothPhotoFile.type,
          data: clothBuffer.toString("base64"),
        },
      },
      { text: prompt }, // Move instructions to the end for better accuracy
    ];

    // 3. The API Call
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: parts,
        },
      ],
      generationConfig: {
        // @ts-expect-error: responseModalities is a 2026 feature
        responseModalities: ["TEXT", "IMAGE"],
        temperature: 0.7, // Keeps the result consistent
      },
    });

    // 🔥 DEBUG (optional but useful)
    console.log(JSON.stringify(result.response, null, 2));

    const candidate = result.response.candidates?.[0];

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: "No response from AI" },
        { status: 500 },
      );
    }

    const responseParts = candidate.content.parts as GeminiPart[];

    let imageData: string | null = null;
    let textData = "";

    // ✅ SAFE PARSING
    for (const part of responseParts) {
      if (part.inlineData?.data) {
        imageData = part.inlineData.data;
      }
      if (part.text) {
        textData += part.text;
      }
    }

    // ✅ NO CRASH — fallback safe
    return NextResponse.json({
      success: true,
      resultImage: imageData ? `data:image/jpeg;base64,${imageData}` : null,
      suggestions: textData || "No suggestions available",
      message: imageData
        ? "Try-on generated successfully ✨"
        : "No image generated, but suggestions are ready",
    });
  } catch (error: unknown) {
    console.error("Server error:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
