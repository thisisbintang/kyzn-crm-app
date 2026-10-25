import { describe, expect, it } from "vitest"

import { leadFormSchema } from "./-lead-form"

const validValues = {
  fullName: "Budi Santoso",
  phoneNumber: "08123456789",
  email: "budi@example.com",
  leadSource: "Website",
  interestedVenue: "KYZN Bekasi",
  assignedSalesConsultant: "John Doe",
  nextFollowUpDate: new Date("2026-02-01T00:00:00.000Z"),
}

describe("leadFormSchema", () => {
  it("accepts valid values without a last contact date", () => {
    const result = leadFormSchema.safeParse(validValues)

    expect(result.success).toBe(true)
  })

  it("requires every field except the last contact date", () => {
    const result = leadFormSchema.safeParse({
      fullName: "",
      phoneNumber: "",
      email: "",
      leadSource: "",
      interestedVenue: "",
      assignedSalesConsultant: "",
      nextFollowUpDate: undefined,
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual([
      "fullName",
      "phoneNumber",
      "email",
      "leadSource",
      "interestedVenue",
      "assignedSalesConsultant",
      "nextFollowUpDate",
    ])
  })

  it("rejects an invalid email address", () => {
    const result = leadFormSchema.safeParse({
      ...validValues,
      email: "not-an-email",
    })

    expect(result.success).toBe(false)
  })

  it("rejects a phone number with fewer than 7 digits", () => {
    const result = leadFormSchema.safeParse({
      ...validValues,
      phoneNumber: "12345",
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues[0]?.message).toBe("Enter a valid phone number")
  })

  it("requires a next follow-up date", () => {
    const result = leadFormSchema.safeParse({
      ...validValues,
      nextFollowUpDate: undefined,
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues[0]?.message).toBe(
      "Next follow-up date is required"
    )
  })

  it("trims string values", () => {
    const result = leadFormSchema.safeParse({
      ...validValues,
      fullName: "  Budi Santoso  ",
      email: "  budi@example.com  ",
      phoneNumber: "  08123456789  ",
    })

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data.fullName).toBe("Budi Santoso")
    expect(result.data.email).toBe("budi@example.com")
    expect(result.data.phoneNumber).toBe("08123456789")
  })
})
