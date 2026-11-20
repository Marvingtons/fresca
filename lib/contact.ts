import { z } from "zod";

/** Shared by the contact form (inline validation) and app/api/contact. */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please tell me your name.").max(120, "That name is a little long."),
  email: z.string().trim().min(1, "Please enter your email.").pipe(z.email("Please enter a valid email address.")),
  message: z
    .string()
    .trim()
    .min(10, "A sentence or two about your project helps me reply.")
    .max(5000, "Please keep it under 5,000 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactInput;

export { HONEYPOT } from "./honeypot";
