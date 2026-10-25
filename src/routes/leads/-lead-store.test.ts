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
    expect(result.lead.lastContactDate).toBeNull()
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
    const result = useLeadStore.getState().addLead(createInput())
    expect(result.ok).toBe(true)
    if (!result.ok) return

    useLeadStore.setState({
      leads: [
        {
          ...result.lead,
          lastContactDate: new Date("2026-01-15T00:00:00.000Z"),
        },
      ],
    })

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

describe("changeLeadStatus", () => {
  function addPendingLead() {
    const result = useLeadStore.getState().addLead(createInput())

    if (!result.ok) {
      throw new Error("Expected the lead to be created")
    }

    return result.lead
  }

  it("moves a pending lead to processing and fills the last contact date", () => {
    const lead = addPendingLead()

    const result = useLeadStore
      .getState()
      .changeLeadStatus(lead.id, "processing")

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.lead.status).toBe("processing")
    expect(result.lead.lastContactDate).toBeInstanceOf(Date)
    expect(useLeadStore.getState().leads).toEqual([result.lead])
  })

  it("keeps an existing last contact date", () => {
    const lastContactDate = new Date("2026-01-15T00:00:00.000Z")
    const added = useLeadStore.getState().addLead(createInput())

    if (!added.ok) {
      throw new Error("Expected the lead to be created")
    }

    useLeadStore.setState({
      leads: [{ ...added.lead, lastContactDate }],
    })

    const result = useLeadStore
      .getState()
      .changeLeadStatus(added.lead.id, "processing")

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.lead.lastContactDate).toEqual(lastContactDate)
  })

  it("fills the last contact date when a processing lead succeeds", () => {
    const lead = addPendingLead()
    useLeadStore.setState({ leads: [{ ...lead, status: "processing" }] })

    const result = useLeadStore.getState().changeLeadStatus(lead.id, "success")

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.lead.status).toBe("success")
    expect(result.lead.lastContactDate).toBeInstanceOf(Date)
  })

  it("does not fill the last contact date when a lead fails", () => {
    const lead = addPendingLead()

    const result = useLeadStore.getState().changeLeadStatus(lead.id, "failed")

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.lead.lastContactDate).toBeNull()
  })

  it("rejects transitions outside the state machine", () => {
    const lead = addPendingLead()

    const result = useLeadStore.getState().changeLeadStatus(lead.id, "success")

    expect(result).toEqual({ ok: false, reason: "invalid-transition" })
    expect(useLeadStore.getState().leads[0].status).toBe("pending")
  })

  it("returns not-found for an unknown lead", () => {
    const result = useLeadStore
      .getState()
      .changeLeadStatus("missing", "processing")

    expect(result).toEqual({ ok: false, reason: "not-found" })
  })

  it("treats the current status as a no-op", () => {
    const lead = addPendingLead()

    const result = useLeadStore.getState().changeLeadStatus(lead.id, "pending")

    expect(result).toEqual({ ok: true, lead })
  })

  it("blocks reopening a closed lead that conflicts by email", () => {
    const closed = addPendingLead()
    useLeadStore.setState({ leads: [{ ...closed, status: "success" }] })

    const active = useLeadStore
      .getState()
      .addLead(createInput({ phoneNumber: "08999999999" }))
    expect(active.ok).toBe(true)

    const result = useLeadStore
      .getState()
      .changeLeadStatus(closed.id, "processing")

    expect(result).toEqual({
      ok: false,
      reason: "conflict",
      conflict: { email: true, phoneNumber: false },
    })
    expect(
      useLeadStore.getState().leads.find((lead) => lead.id === closed.id)
        ?.status
    ).toBe("success")
  })

  it("blocks reopening a closed lead that conflicts by phone number", () => {
    const closed = addPendingLead()
    useLeadStore.setState({ leads: [{ ...closed, status: "failed" }] })

    const active = useLeadStore
      .getState()
      .addLead(createInput({ email: "other@example.com" }))
    expect(active.ok).toBe(true)

    const result = useLeadStore
      .getState()
      .changeLeadStatus(closed.id, "processing")

    expect(result).toEqual({
      ok: false,
      reason: "conflict",
      conflict: { email: false, phoneNumber: true },
    })
  })

  it("allows reopening when other leads with the same contact details are closed", () => {
    const first = addPendingLead()
    const second = useLeadStore
      .getState()
      .addLead(
        createInput({ email: "second@example.com", phoneNumber: "08999999999" })
      )

    if (!second.ok) {
      throw new Error("Expected the second lead to be created")
    }

    useLeadStore.setState({
      leads: [
        { ...second.lead, status: "failed", email: first.email },
        { ...first, status: "success" },
      ],
    })

    const result = useLeadStore
      .getState()
      .changeLeadStatus(first.id, "processing")

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.lead.status).toBe("processing")
  })
})

describe("updateLead", () => {
  function addTestLead(input: Partial<NewLeadInput> = {}) {
    const result = useLeadStore.getState().addLead(createInput(input))

    if (!result.ok) {
      throw new Error("Expected the lead to be created")
    }

    return result.lead
  }

  it("updates editable fields and keeps system fields", () => {
    const lead = addTestLead()
    const before = useLeadStore.getState().leads[0]

    const result = useLeadStore.getState().updateLead(lead.id, {
      email: "  new@example.com  ",
      fullName: "  Budi Updated  ",
      phoneNumber: "  08999999999  ",
      leadSource: "Referral",
      interestedVenue: "KYZN BSD",
      assignedSalesConsultant: "Jane Smith",
      nextFollowUpDate: new Date("2026-03-01T00:00:00.000Z"),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.lead.email).toBe("new@example.com")
    expect(result.lead.fullName).toBe("Budi Updated")
    expect(result.lead.phoneNumber).toBe("08999999999")
    expect(result.lead.leadSource).toBe("Referral")
    expect(result.lead.interestedVenue).toBe("KYZN BSD")
    expect(result.lead.assignedSalesConsultant).toBe("Jane Smith")
    expect(result.lead.nextFollowUpDate).toEqual(
      new Date("2026-03-01T00:00:00.000Z")
    )
    expect(result.lead.id).toBe(before.id)
    expect(result.lead.status).toBe(before.status)
    expect(result.lead.creationDate).toEqual(before.creationDate)
    expect(result.lead.lastContactDate).toBeNull()
    expect(useLeadStore.getState().leads).toEqual([result.lead])
  })

  it("allows keeping the lead's own email and phone number", () => {
    const lead = addTestLead()

    const result = useLeadStore.getState().updateLead(lead.id, createInput())

    expect(result.ok).toBe(true)
  })

  it("preserves the last contact date and status", () => {
    const lead = addTestLead()
    const processed = useLeadStore
      .getState()
      .changeLeadStatus(lead.id, "processing")

    expect(processed.ok).toBe(true)
    if (!processed.ok) return

    const result = useLeadStore
      .getState()
      .updateLead(lead.id, createInput({ fullName: "Budi Santoso II" }))

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.lead.status).toBe("processing")
    expect(result.lead.lastContactDate).toEqual(processed.lead.lastContactDate)
    expect(result.lead.fullName).toBe("Budi Santoso II")
  })

  it("rejects an email used by another active lead", () => {
    const first = addTestLead()
    addTestLead({ email: "other@example.com", phoneNumber: "08999999999" })

    const result = useLeadStore.getState().updateLead(first.id, {
      ...createInput(),
      email: "OTHER@example.com",
    })

    expect(result).toEqual({
      ok: false,
      errors: { email: "A lead with this email already exists." },
    })
    expect(
      useLeadStore.getState().leads.find((item) => item.id === first.id)
    ).toEqual(first)
  })

  it("rejects a phone number used by another active lead", () => {
    const first = addTestLead()
    addTestLead({ email: "other@example.com", phoneNumber: "08999999999" })

    const result = useLeadStore.getState().updateLead(first.id, {
      ...createInput({ email: first.email }),
      phoneNumber: "+62 899-9999-999",
    })

    expect(result).toEqual({
      ok: false,
      errors: { phoneNumber: "A lead with this phone number already exists." },
    })
  })

  it("ignores conflicts with closed leads", () => {
    const first = addTestLead()
    const closed = addTestLead({
      email: "closed@example.com",
      phoneNumber: "08999999999",
    })
    useLeadStore.setState((state) => ({
      leads: state.leads.map((item) =>
        item.id === closed.id ? { ...item, status: "success" as const } : item
      ),
    }))

    const result = useLeadStore.getState().updateLead(first.id, {
      ...createInput(),
      email: "closed@example.com",
      phoneNumber: "08999999999",
    })

    expect(result.ok).toBe(true)
  })

  it("skips the conflict check when editing a closed lead", () => {
    const active = addTestLead()
    const closed = addTestLead({
      email: "closed@example.com",
      phoneNumber: "08999999999",
    })
    useLeadStore.setState((state) => ({
      leads: state.leads.map((item) =>
        item.id === closed.id ? { ...item, status: "failed" as const } : item
      ),
    }))

    const result = useLeadStore.getState().updateLead(closed.id, {
      ...createInput(),
      email: active.email,
      phoneNumber: active.phoneNumber,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.lead.email).toBe(active.email)
    expect(result.lead.phoneNumber).toBe(active.phoneNumber)
  })

  it("returns not-found for an unknown lead", () => {
    const result = useLeadStore.getState().updateLead("missing", createInput())

    expect(result).toEqual({ ok: false, reason: "not-found" })
  })
})
