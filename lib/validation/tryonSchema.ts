import { z } from "zod";

const isFile = (file: unknown): file is File => {
  return (
    typeof file === "object" &&
    file !== null &&
    "size" in file &&
    "type" in file
  );
};

const imageFileSchema = z
  .custom<File>((file) => isFile(file), {
    message: "File is required",
  })
  .refine((file) => file.size > 0, {
    message: "File cannot be empty",
  })
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "Image must be less than 5MB",
  })
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    {
      message: "Only JPG, PNG, or WebP images are allowed",
    },
  );

export const tryOnRequestSchema = z
  .object({
    usePreviousUserPhoto: z.boolean(),

    userPhoto: imageFileSchema.optional(),

    clothPhoto: imageFileSchema,
  })

  .refine(
    (data) =>
      (data.usePreviousUserPhoto && !data.userPhoto) ||
      (!data.usePreviousUserPhoto && data.userPhoto),
    {
      message: "Either use your previous photo OR upload a new one (not both)",
      path: ["userPhoto"],
    },
  );

export type TryOnRequest = z.infer<typeof tryOnRequestSchema>;
