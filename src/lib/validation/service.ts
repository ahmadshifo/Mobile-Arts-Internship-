import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().trim().min(1, "Enter a service name."),

  provider: z.string().trim().min(1, "Enter the content provider."),

  category: z.enum([
    "Games",
    "Video",
    "Education",
    "Health & fitness",
    "News",
  ]),

  description: z
    .string()
    .max(120, "Max 120 characters.")
    .optional(),

  operator: z.enum([
    "Cedar Mobile",
    "Gulf Connect",
    "Nova Telecom",
  ]),

  price: z.coerce
    .number({ invalid_type_error: "Enter a price." })
    .gt(0, "Price must be greater than 0.")
    .max(50, "Price can’t be more than $50."),

  cycle: z.enum(["Daily", "Weekly", "Monthly"]),

  trialDays: z.coerce.number().refine(
    (value): value is 0 | 1 | 3 | 7 =>
      [0, 1, 3, 7].includes(value),
  ),

  keyword: z
    .string()
    .regex(
      /^[A-Z]{2,10}$/,
      "Use 2–10 capital letters, e.g. PLAY.",
    ),

  shortcode: z
    .string()
    .regex(/^\d{3,6}$/, "Use 3–6 digits, e.g. 1234."),

  notificationUrl: z
    .string()
    .url("Enter a valid URL.")
    .startsWith(
      "https://",
      "Enter a URL that starts with https://",
    ),

  sendWelcomeSms: z.boolean(),

  status: z.enum(["Active", "Paused"]),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
export type ServiceFormInput = z.input<typeof serviceSchema>;