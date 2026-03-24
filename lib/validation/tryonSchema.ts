import { z } from "zod";

const imageFileSchema = z
  .instanceof(File, { message: "File required hai" })
  .refine((file) => file.size > 0, { message: "File khali nahi ho sakti" })
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "Image size 5MB se zyada nahi honi chahiye",
  })
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    { message: "Sirf JPG, PNG ya WebP format allowed hai" },
  );

export const tryOnRequestSchema = z
  .object({
    usePreviousUserPhoto: z.boolean().default(false),

    userPhoto: imageFileSchema.optional(),

    clothPhoto: imageFileSchema,
  })
  .refine((data) => data.usePreviousUserPhoto || data.userPhoto, {
    message: "Either use your previous photo or upload a new user photo",
    path: ["userPhoto"],
  });

export type TryOnRequest = z.infer<typeof tryOnRequestSchema>;
