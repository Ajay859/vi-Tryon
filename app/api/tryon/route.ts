import { tryOnRequestSchema } from "@/lib/validation/tryonSchema";
import { TRYON_SUGGESTION_PROMPT } from "@/lib/prompt";
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { GoogleGenerativeAI } from "@google/generative-ai";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const usePreviousUserPhoto =
      formData.get("usePreviousUserPhoto") === "true";

    const userPhoto = formData.get("userPhoto") as File | null;
    const clothPhoto = formData.get("clothPhoto") as File | null;

    //  Validation
    const validation = tryOnRequestSchema.safeParse({
      usePreviousUserPhoto,
      userPhoto,
      clothPhoto,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.issues.map((i) => ({
            field: String(i.path[0]),
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }

    //  Required checks
    if (!clothPhoto) {
      return NextResponse.json(
        { success: false, error: "Cloth photo is required" },
        { status: 400 },
      );
    }

    if (!usePreviousUserPhoto && !userPhoto) {
      return NextResponse.json(
        { success: false, error: "User photo is required" },
        { status: 400 },
      );
    }

    // Convert cloth image → base64
    const clothBuffer = Buffer.from(await clothPhoto.arrayBuffer());
    const clothBase64 = `data:${clothPhoto.type};base64,${clothBuffer.toString(
      "base64",
    )}`;

    let userBase64: string;

    if (usePreviousUserPhoto) {
      return NextResponse.json(
        {
          success: false,
          error: "Previous photo retrieval not yet implemented",
        },
        { status: 501 },
      );
    } else {
      const userBuffer = Buffer.from(await userPhoto!.arrayBuffer());
      userBase64 = `data:${userPhoto!.type};base64,${userBuffer.toString(
        "base64",
      )}`;
    }

    //  CALLVTON MODEL
    console.log("Calling flux-vton...");

    const output = await replicate.run(
      "subhash25rawat/flux-vton:a02643ce418c0e12bad371c4adbfaec0dd1cb34b034ef37650ef205f92ad6199",
      {
        input: {
          part: "upper_body", // 👉 change dynamically later
          image: userBase64,
          garment: clothBase64,
        },
      },
    );

    //  Handle output safely
    const fileOutput = Array.isArray(output) ? output[0] : output;

    if (!fileOutput) {
      throw new Error("No output returned from flux-vton");
    }

    //  Convert to base64 image
    const blob = await fileOutput.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    const imageBase64 = `data:image/png;base64,${imageBuffer.toString(
      "base64",
    )}`;

    console.log("Image generated successfully (flux-vton)");

    //  Gemini suggestions (optional, non-blocking)
    let suggestions = "";

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const result = await model.generateContent([
        {
          inlineData: {
            data: clothBuffer.toString("base64"),
            mimeType: clothPhoto.type,
          },
        },
        TRYON_SUGGESTION_PROMPT,
      ]);

      suggestions = result.response.text();
    } catch (geminiError) {
      console.warn("Gemini suggestions failed:", geminiError);
      suggestions = "Style suggestions unavailable right now.";
    }

    //  Final response
    return NextResponse.json({
      success: true,
      image: imageBase64,
      suggestions,
      message: "Your outfit is ready! ✨",
    });
  } catch (error: unknown) {
    console.error("Try-on API Error:", error);

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
