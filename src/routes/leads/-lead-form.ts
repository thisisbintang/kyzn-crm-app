import { isSameDay, startOfToday } from "date-fns"
import * as z from "zod"

export function createLeadFormSchema(options?: {
  originalNextFollowUpDate?: Date
}) {
  const originalNextFollowUpDate = options?.originalNextFollowUpDate

  return z.object({
    fullName: z.string().trim().min(1, "Full name is required"),
    phoneNumber: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .pipe(
        z
          .string()
          .refine(
            (value) => value.replace(/\D/g, "").length >= 7,
            "Enter a valid phone number"
          )
      ),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .pipe(z.email("Enter a valid email address")),
    leadSource: z.string().trim().min(1, "Lead source is required"),
    interestedVenue: z.string().trim().min(1, "Interested venue is required"),
    assignedSalesConsultant: z
      .string()
      .trim()
      .min(1, "Assigned sales consultant is required"),
    nextFollowUpDate: z
      .date({ error: "Next follow-up date is required" })
      .refine(
        (date) =>
          date >= startOfToday() ||
          (originalNextFollowUpDate !== undefined &&
            isSameDay(date, originalNextFollowUpDate)),
        "Next follow-up date cannot be in the past"
      ),
  })
}

export const leadFormSchema = createLeadFormSchema()

export type LeadFormValues = z.infer<typeof leadFormSchema>
