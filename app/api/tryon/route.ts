import { tryOnRequestSchema } from "@/lib/validation/tryonSchema";
import { prompt, TRYON_SUGGESTION_PROMPT } from "@/lib/prompt";

import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { GoogleGenerativeAI } from "@google/generative-ai";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const usePreviousUserPhoto =
      formData.get("usePreviousUserPhoto") === "true";

    const userPhoto = formData.get("userPhoto") as File | null;
    const clothPhoto = formData.get("clothPhoto") as File | null;

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

    if (!userPhoto || !clothPhoto) {
      return NextResponse.json(
        {
          success: false,
          error: "Both photos are required",
        },
        { status: 400 },
      );
    }

    const userBuffer = Buffer.from(await userPhoto.arrayBuffer());
    const clothBuffer = Buffer.from(await clothPhoto.arrayBuffer());

    const userBase64 = `data:${userPhoto.type};base64,${userBuffer.toString(
      "base64",
    )}`;
    const clothBase64 = `data:${clothPhoto.type};base64,${clothBuffer.toString(
      "base64",
    )}`;

    console.log(" Calling Flux-2-Pro...");

    const stream = await replicate.run("black-forest-labs/flux-2-pro", {
      input: {
        prompt: prompt,
        image: userBase64,
        image2: clothBase64,
        width: 1024,
        height: 1536,
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 28,
        strength: 0.8,
      },
    });

    const chunks: Uint8Array[] = [];

    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }

    if (chunks.length === 0) {
      throw new Error("No data received from Replicate");
    }

    const fullBuffer = Buffer.concat(chunks);

    const imageBase64 = `data:image/png;base64,${fullBuffer.toString("base64")}`;

    console.log("✅ Image generated successfully");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(TRYON_SUGGESTION_PROMPT);

    const suggestions = result.response.text();

    return NextResponse.json({
      success: true,
      image: imageBase64,
      suggestions,
      message: "Your outfit is ready ",
    });
  } catch (error: unknown) {
    console.error(" Try-on API Error:", error);

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
