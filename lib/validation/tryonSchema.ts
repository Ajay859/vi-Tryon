import z, { file } from "zod";

export const imageSchema = z.object({
  userPhoto: z
    .instanceof(File)
    .refine((file) => file.size > 0, { message: " image is required " })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "image size should be less than 5mb",
    })
    .refine(
      (file) => ["image/jpg", "image/png", "image/webp"].includes(file.type),
      { message: "only jpg,png or webp formate is allowed" },
    ),

  colthPhoto: z
    .instanceof(File)
    .refine((file) => file.size > 0, { message: " image is required " })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "image size should be less than 5mb",
    })
    .refine(
      (file) => ["image/jpg", "image/png", "image/webp"].includes(file.type),
      { message: "only jpg,png or webp formate is allowed" },
    ),
});


