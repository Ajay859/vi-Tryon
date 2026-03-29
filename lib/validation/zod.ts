import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "name should be atleast 2 characters long")
    .max(30, "name should be under 30 letters"),

  email: z.string().email(),

  password: z
    .string()
    .min(8, "password must be at least 8 characters long ")
    .regex(/[a-z]/, {
      message: "password must include at least 1 small letter",
    })
    .regex(/[A-Z]/, {
      message: "password must include at least 1 capital letter",
    })
    .regex(/[0-9]/, { message: "password must include at least 1 number" })
    .regex(/[^a-zA-Z0-9]/, {
      message:
        "password must include at least 1 special character (@$!%*?& etc.)",
    }),
});

export type SignupInput = z.infer<typeof signupSchema>;
