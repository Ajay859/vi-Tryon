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
        {
          message: "unauthorized plz login first",
        },
        { status: 401 },
      );
    }

    const formData = await req.formData();

    const useUserPreviousPhoto =
      formData.get("useUserPreviousPhoto") === "true";

    const userPhotoFile = formData.get("userPhoto") as File | null;
    const clothPhotoFile = formData.get("colthPhoto") as File | null;

    const validation = tryOnRequestSchema.safeParse({
      useUserPreviousPhoto,
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
    if (useUserPreviousPhoto) {
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

    const parts: any[] = [{ text: prompt }];

    if (useBuffer) {
      parts.push({
        inlineData: {
          mimeType: userPhotoToUse?.type,
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

    const result = await model.generateContent(parts);

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

    // 🎯 8. Final response
    return NextResponse.json({
      success: true,
      resultImage: `data:image/jpeg;base64,${generatedImage}`,
      suggestions: textPart?.text || "",
      message: "Try-on ready ✨",
    });
  } catch (error: any) {
    console.error("Try-on API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Server error occurred",
      },
      { status: 500 },
    );
  }
}
