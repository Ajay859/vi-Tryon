import { tryOnRequestSchema } from "@/lib/validation/tryonSchema";
import { TRYON_SUGGESTION_PROMPT } from "@/lib/prompt";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const API_URL = process.env.COLAB_API_URL!;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const userPhoto = formData.get("userPhoto") as File | null;
    const clothPhoto = formData.get("clothPhoto") as File | null;

    const validation = tryOnRequestSchema.safeParse({
      userPhoto,
      clothPhoto,
      usePreviousUserPhoto: false,
    });

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed" },
        { status: 400 }
      );
    }


    let imageBase64: string | null = null;
    let imageError: string | null = null;

    try {
      const fd = new FormData();
      fd.append("person", userPhoto!);
      fd.append("garment", clothPhoto!);

      const res = await fetch(`${API_URL}/tryon`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok || !data.image) {
        throw new Error(data.error || "Image generation failed");
      }

      imageBase64 = data.image;
    } catch (err) {
      imageError =
        err instanceof Error ? err.message : "Image generation failed";
    }

    // =========================
    // 🤖 GEMINI SUGGESTIONS
    // =========================
    let suggestions = "Suggestions unavailable.";
    let suggestionSuccess = false;

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const parts: any[] = [];

      if (imageBase64) {
        parts.push({
          inlineData: {
            data: imageBase64,
            mimeType: "image/png",
          },
        });
      } else {
        const clothBuffer = Buffer.from(await clothPhoto!.arrayBuffer());
        parts.push({
          inlineData: {
            data: clothBuffer.toString("base64"),
            mimeType: clothPhoto!.type || "image/png",
          },
        });
      }

      parts.push({ text: TRYON_SUGGESTION_PROMPT });

      const result = await model.generateContent(parts);
      suggestions = result.response.text().trim();
      suggestionSuccess = true;
    } catch (err) {
      suggestionSuccess = false;
    }

    return NextResponse.json({
      success: Boolean(imageBase64),
      image: imageBase64,
      suggestions,
      imageError,
      suggestionSuccess,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}