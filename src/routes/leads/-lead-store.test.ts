import { beforeEach, describe, expect, it } from "vitest"

import type { NewLeadInput } from "./-lead"
import { LEADS_STORAGE_KEY, useLeadStore } from "./-lead-store"

function createInput(overrides: Partial<NewLeadInput> = {}): NewLeadInput {
  return {
    email: "budi@example.com",
    fullName: "Budi Santoso",
    phoneNumber: "08123456789",
    leadSource: "Website",
    interestedVenue: "KYZN Bekasi",
    assignedSalesConsultant: "John Doe",
    lastContactDate: null,
    nextFollowUpDate: new Date("2026-02-01T00:00:00.000Z"),
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
  useLeadStore.setState({ leads: [] })
})

describe("addLead", () => {
  it("creates a pending lead with system fields", () => {
    const result = useLeadStore.getState().addLead(createInput())

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.lead.id).toEqual(expect.any(String))
    expect(result.lead.status).toBe("pending")
    expect(result.lead.creationDate).toBeInstanceOf(Date)
    expect(result.lead.email).toBe("budi@example.com")
    expect(useLeadStore.getState().leads).toEqual([result.lead])
  })

  it("puts the newest lead first", () => {
    const first = useLeadStore.getState().addLead(createInput())
    const second = useLeadStore
      .getState()
      .addLead(
        createInput({ email: "second@example.com", phoneNumber: "08999999999" })
      )

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    expect(useLeadStore.getState().leads.map((lead) => lead.email)).toEqual([
      "second@example.com",
      "budi@example.com",
    ])
  })

  it("rejects a duplicate email case-insensitively", () => {
    useLeadStore.getState().addLead(createInput())

    const result = useLeadStore.getState().addLead(
      createInput({
        email: "  BUDI@example.com ",
        phoneNumber: "08999999999",
      })
    )

    expect(result).toEqual({
      ok: false,
      errors: { email: "A lead with this email already exists." },
    })
    expect(useLeadStore.getState().leads).toHaveLength(1)
  })

  it("rejects a duplicate phone number across 0 and 62 formats", () => {
    useLeadStore.getState().addLead(createInput())

    const result = useLeadStore.getState().addLead(
      createInput({
        email: "other@example.com",
        phoneNumber: "+62 812-3456-789",
      })
    )

    expect(result).toEqual({
      ok: false,
      errors: { phoneNumber: "A lead with this phone number already exists." },
    })
    expect(useLeadStore.getState().leads).toHaveLength(1)
  })

  it("reports both conflicts at once", () => {
    useLeadStore.getState().addLead(createInput())

    const result = useLeadStore.getState().addLead(createInput())

    expect(result).toEqual({
      ok: false,
      errors: {
        email: "A lead with this email already exists.",
        phoneNumber: "A lead with this phone number already exists.",
      },
    })
  })

  it("allows reusing the email and phone of closed leads", () => {
    const first = useLeadStore.getState().addLead(createInput())
    expect(first.ok).toBe(true)
    if (!first.ok) return

    useLeadStore.setState({
      leads: [{ ...first.lead, status: "success" }],
    })

    const result = useLeadStore.getState().addLead(createInput())

    expect(result.ok).toBe(true)
    expect(useLeadStore.getState().leads).toHaveLength(2)
  })
})

describe("persistence", () => {
  it("stores leads in localStorage with ISO dates", () => {
    useLeadStore.getState().addLead(createInput())

    const raw = localStorage.getItem(LEADS_STORAGE_KEY)
    expect(raw).not.toBeNull()

    const persisted = JSON.parse(raw as string)
    const storedLead = persisted.state.leads[0]

    expect(storedLead.creationDate).toEqual(expect.any(String))
    expect(storedLead.nextFollowUpDate).toEqual(expect.any(String))
    expect(storedLead.lastContactDate).toBeNull()
  })

  it("revives ISO dates when rehydrating", async () => {
    const result = useLeadStore.getState().addLead(
      createInput({
        lastContactDate: new Date("2026-01-15T00:00:00.000Z"),
      })
    )
    expect(result.ok).toBe(true)

    const raw = localStorage.getItem(LEADS_STORAGE_KEY) as string
    useLeadStore.setState({ leads: [] })
    localStorage.setItem(LEADS_STORAGE_KEY, raw)
    await useLeadStore.persist.rehydrate()

    const [lead] = useLeadStore.getState().leads
    expect(lead.creationDate).toBeInstanceOf(Date)
    expect(lead.lastContactDate).toBeInstanceOf(Date)
    expect(lead.nextFollowUpDate).toBeInstanceOf(Date)
    expect(lead.lastContactDate?.toISOString()).toBe("2026-01-15T00:00:00.000Z")
  })

  it("drops invalid leads from storage", async () => {
    localStorage.setItem(
      LEADS_STORAGE_KEY,
      JSON.stringify({ state: { leads: [{ id: "broken" }] }, version: 1 })
    )

    await useLeadStore.persist.rehydrate()

    expect(useLeadStore.getState().leads).toEqual([])
  })
})
