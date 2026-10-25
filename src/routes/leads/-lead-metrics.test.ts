import { describe, expect, it } from "vitest"

import { type Lead } from "./-lead"
import { getLeadMetrics } from "./-lead-metrics"

const NOW = new Date(2026, 9, 25, 12, 0, 0)

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
    creationDate: new Date(2026, 9, 5, 9, 0, 0),
    lastContactDate: null,
    nextFollowUpDate: new Date(2026, 9, 20, 9, 0, 0),
    ...overrides,
  }
}

describe("getLeadMetrics", () => {
  it("returns zeros for an empty list", () => {
    expect(getLeadMetrics([], NOW)).toEqual({
      total: 0,
      pending: 0,
      processing: 0,
      success: 0,
      failed: 0,
      active: 0,
      closed: 0,
      newThisMonth: 0,
      followUpsDue: 0,
      overdueFollowUps: 0,
      conversionRate: 0,
    })
  })

  it("counts leads by status and splits active and closed", () => {
    const metrics = getLeadMetrics(
      [
        createLead({ id: "pending", status: "pending" }),
        createLead({ id: "processing", status: "processing" }),
        createLead({ id: "success", status: "success" }),
        createLead({ id: "failed-1", status: "failed" }),
        createLead({ id: "failed-2", status: "failed" }),
      ],
      NOW
    )

    expect(metrics.total).toBe(5)
    expect(metrics.pending).toBe(1)
    expect(metrics.processing).toBe(1)
    expect(metrics.success).toBe(1)
    expect(metrics.failed).toBe(2)
    expect(metrics.active).toBe(2)
    expect(metrics.closed).toBe(3)
  })

  it("counts only leads created in the current calendar month", () => {
    const metrics = getLeadMetrics(
      [
        createLead({
          id: "first",
          creationDate: new Date(2026, 9, 1, 8, 0, 0),
        }),
        createLead({
          id: "last",
          creationDate: new Date(2026, 9, 31, 20, 0, 0),
        }),
        createLead({
          id: "previous",
          creationDate: new Date(2026, 8, 30, 20, 0, 0),
        }),
        createLead({
          id: "next",
          creationDate: new Date(2026, 10, 1, 0, 30, 0),
        }),
      ],
      NOW
    )

    expect(metrics.newThisMonth).toBe(2)
  })

  it("counts active leads whose follow-up is due today or overdue", () => {
    const metrics = getLeadMetrics(
      [
        createLead({
          id: "overdue",
          nextFollowUpDate: new Date(2026, 9, 24, 9, 0, 0),
        }),
        createLead({
          id: "today",
          status: "processing",
          nextFollowUpDate: new Date(2026, 9, 25, 0, 0, 0),
        }),
        createLead({
          id: "tomorrow",
          nextFollowUpDate: new Date(2026, 9, 26, 9, 0, 0),
        }),
      ],
      NOW
    )

    expect(metrics.followUpsDue).toBe(2)
    expect(metrics.overdueFollowUps).toBe(1)
  })

  it("ignores closed leads with a past follow-up date", () => {
    const metrics = getLeadMetrics(
      [
        createLead({
          id: "success",
          status: "success",
          nextFollowUpDate: new Date(2026, 9, 1, 9, 0, 0),
        }),
        createLead({
          id: "failed",
          status: "failed",
          nextFollowUpDate: new Date(2026, 9, 1, 9, 0, 0),
        }),
      ],
      NOW
    )

    expect(metrics.followUpsDue).toBe(0)
    expect(metrics.overdueFollowUps).toBe(0)
  })

  it("computes the conversion rate from closed leads", () => {
    const metrics = getLeadMetrics(
      [
        createLead({ id: "success-1", status: "success" }),
        createLead({ id: "success-2", status: "success" }),
        createLead({ id: "failed", status: "failed" }),
        createLead({ id: "processing", status: "processing" }),
      ],
      NOW
    )

    expect(metrics.conversionRate).toBeCloseTo(2 / 3)
  })

  it("reports a zero conversion rate when no leads are closed", () => {
    const metrics = getLeadMetrics([createLead({ status: "pending" })], NOW)

    expect(metrics.conversionRate).toBe(0)
  })
})
