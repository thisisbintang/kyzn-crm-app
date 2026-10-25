import { describe, expect, it } from "vitest"

import {
  type Lead,
  canTransitionLeadStatus,
  findLeadById,
  findLeadConflict,
  isActiveLeadStatus,
  normalizeEmail,
  normalizePhoneNumber,
  reviveLead,
} from "./-lead"

function createLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "lead-1",
    status: "pending",
    email: "budi@example.com",
    fullName: "Budi Santoso",
    phoneNumber: "08123456789",
    leadSource: "Website",
    interestedVenue: "KYZN Bekasi",
    assignedSalesConsultant: "John Doe",
    creationDate: new Date("2026-01-01T00:00:00.000Z"),
    lastContactDate: null,
    nextFollowUpDate: new Date("2026-01-10T00:00:00.000Z"),
    ...overrides,
  }
}

describe("normalizeEmail", () => {
  it("trims and lowercases the email", () => {
    expect(normalizeEmail("  Budi@Example.COM ")).toBe("budi@example.com")
  })
})

describe("normalizePhoneNumber", () => {
  it("strips non-digit characters", () => {
    expect(normalizePhoneNumber("+62 812-3456-789")).toBe("628123456789")
  })

  it("treats the 0 prefix and the 62 prefix as equal", () => {
    expect(normalizePhoneNumber("08123456789")).toBe("628123456789")
    expect(normalizePhoneNumber("+62 812 3456 789")).toBe("628123456789")
  })
})

describe("isActiveLeadStatus", () => {
  it("treats only pending and processing as active", () => {
    expect(isActiveLeadStatus("pending")).toBe(true)
    expect(isActiveLeadStatus("processing")).toBe(true)
    expect(isActiveLeadStatus("success")).toBe(false)
    expect(isActiveLeadStatus("failed")).toBe(false)
  })
})

describe("canTransitionLeadStatus", () => {
  it("allows the forward transitions", () => {
    expect(canTransitionLeadStatus("pending", "processing")).toBe(true)
    expect(canTransitionLeadStatus("pending", "failed")).toBe(true)
    expect(canTransitionLeadStatus("processing", "success")).toBe(true)
    expect(canTransitionLeadStatus("processing", "failed")).toBe(true)
    expect(canTransitionLeadStatus("processing", "pending")).toBe(true)
  })

  it("allows reopening closed leads through processing", () => {
    expect(canTransitionLeadStatus("success", "processing")).toBe(true)
    expect(canTransitionLeadStatus("failed", "processing")).toBe(true)
  })

  it("rejects jumps outside the state machine", () => {
    expect(canTransitionLeadStatus("pending", "success")).toBe(false)
    expect(canTransitionLeadStatus("success", "failed")).toBe(false)
    expect(canTransitionLeadStatus("success", "pending")).toBe(false)
    expect(canTransitionLeadStatus("failed", "success")).toBe(false)
    expect(canTransitionLeadStatus("failed", "pending")).toBe(false)
    expect(canTransitionLeadStatus("pending", "pending")).toBe(false)
  })
})

describe("findLeadConflict", () => {
  it("detects a duplicate email case-insensitively", () => {
    const conflict = findLeadConflict([createLead()], {
      email: "  BUDI@example.com ",
      phoneNumber: "08999999999",
    })

    expect(conflict).toEqual({ email: true, phoneNumber: false })
  })

  it("detects a duplicate phone number across 0 and 62 formats", () => {
    const conflict = findLeadConflict([createLead()], {
      email: "other@example.com",
      phoneNumber: "+62 812-3456-789",
    })

    expect(conflict).toEqual({ email: false, phoneNumber: true })
  })

  it("reports both conflicts at once", () => {
    const conflict = findLeadConflict([createLead()], {
      email: "budi@example.com",
      phoneNumber: "08123456789",
    })

    expect(conflict).toEqual({ email: true, phoneNumber: true })
  })

  it("ignores leads with the success and failed statuses", () => {
    const conflict = findLeadConflict(
      [
        createLead({ status: "success" }),
        createLead({ id: "lead-2", status: "failed" }),
      ],
      {
        email: "budi@example.com",
        phoneNumber: "08123456789",
      }
    )

    expect(conflict).toEqual({ email: false, phoneNumber: false })
  })

  it("ignores the excluded lead", () => {
    const lead = createLead()

    const conflict = findLeadConflict(
      [lead],
      { email: lead.email, phoneNumber: lead.phoneNumber },
      lead.id
    )

    expect(conflict).toEqual({ email: false, phoneNumber: false })
  })
})

describe("findLeadById", () => {
  it("returns the matching lead", () => {
    const lead = createLead()

    expect(findLeadById([createLead({ id: "lead-0" }), lead], "lead-1")).toBe(
      lead
    )
  })

  it("returns undefined when the id does not match", () => {
    expect(findLeadById([createLead()], "missing")).toBeUndefined()
  })

  it("returns undefined for an empty list", () => {
    expect(findLeadById([], "lead-1")).toBeUndefined()
  })
})

describe("reviveLead", () => {
  it("revives ISO date strings into Date objects", () => {
    const lead = reviveLead({
      ...createLead(),
      creationDate: "2026-01-01T00:00:00.000Z",
      lastContactDate: "2026-01-05T00:00:00.000Z",
      nextFollowUpDate: "2026-01-10T00:00:00.000Z",
    })

    expect(lead).not.toBeNull()
    expect(lead?.creationDate).toBeInstanceOf(Date)
    expect(lead?.lastContactDate).toBeInstanceOf(Date)
    expect(lead?.nextFollowUpDate).toBeInstanceOf(Date)
  })

  it("keeps a missing last contact date as null", () => {
    const lead = reviveLead({
      ...createLead(),
      creationDate: "2026-01-01T00:00:00.000Z",
      lastContactDate: null,
      nextFollowUpDate: "2026-01-10T00:00:00.000Z",
    })

    expect(lead?.lastContactDate).toBeNull()
  })

  it("rejects values missing required fields", () => {
    expect(reviveLead({ id: "lead-1" })).toBeNull()
    expect(
      reviveLead({
        ...createLead(),
        status: "unknown",
        creationDate: "2026-01-01T00:00:00.000Z",
      })
    ).toBeNull()
    expect(reviveLead("not-an-object")).toBeNull()
  })
})
