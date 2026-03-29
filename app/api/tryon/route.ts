import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { prompt } from "@/lib/prompt";
import { tryOnRequestSchema } from "@/lib/validation/tryonSchema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
        {
          message: "unauthorized plz login first",
        },
        { status: 401 },
      );
    }

    const formData = await req.formData();

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
          error: "validation failed",
          details: validation.error.issues.map((issue) => ({
            field: String(issue.path[0]),
            message: issue.message,
          })),
        },
        {
          status: 400,
        },
      );
    }
    let userPhotoToUse = userPhotoFile;
    if (usePreviousUserPhoto) {
      const userData = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          userPhotourl: true,
        },
      });

      if (!userData?.userPhotourl) {
        return NextResponse.json(
          {
            success: false,
            error: "no previous photo found plz upload new one to continue",
          },
          {
            status: 400,
          },
        );
      }

      const res = await fetch(userData.userPhotourl);
      const buffer = await res.arrayBuffer();

      userPhotoToUse = new File([buffer], "previous.jpg", {
        type: "image/jpeg",
      });
    }

    if (!userPhotoToUse) {
      return NextResponse.json(
        {
          success: false,
          error: "user photo is required ",
        },
        {
          status: 400,
        },
      );
    }

    if (!clothPhotoFile) {
      return NextResponse.json(
        {
          success: false,
          error: "clothe photo is required ",
        },
        {
          status: 400,
        },
      );
    }

    const useBuffer = userPhotoToUse
      ? Buffer.from(await userPhotoToUse.arrayBuffer())
      : null;

    const clothBuffer = Buffer.from(await clothPhotoFile.arrayBuffer());

    const model = GenAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const parts: GeminiPart[] = [{ text: prompt }];

    if (useBuffer) {
      parts.push({
        inlineData: {
          mimeType: userPhotoToUse.type,
          data: useBuffer.toString("base64"),
        },
      });
    }

    parts.push({
      inlineData: {
        mimeType: clothPhotoFile.type,
        data: clothBuffer.toString("base64"),
      },
    });

    const result = await model.generateContent(parts as any);

    const candidate = result.response.candidates?.[0];

    if (!candidate) {
      throw new Error("no response from Ai");
    }

    const responseParts = candidate.content.parts as GeminiPart[];

    const imagePart = responseParts.find((p) => p.inlineData);
    const textPart = responseParts.find((p) => p.text);

    if (!imagePart || !imagePart.inlineData) {
      throw new Error("no image generated sorry");
    }
    const generatedImage = imagePart.inlineData.data;

    // Final response
    return NextResponse.json({
      success: true,
      resultImage: `data:image/jpeg;base64,${generatedImage}`,
      suggestions: textPart?.text || "",
      message: "Try-on ready ",
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: formattedErrors,
        },
        { status: 400 },
      );
    }

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
