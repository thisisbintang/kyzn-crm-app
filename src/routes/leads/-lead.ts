export const LEAD_STATUSES = [
  "pending",
  "processing",
  "success",
  "failed",
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export type Lead = {
  id: string
  status: LeadStatus
  email: string
  fullName: string
  phoneNumber: string
  leadSource: string
  interestedVenue: string
  assignedSalesConsultant: string
  creationDate: Date
  lastContactDate: Date | null
  nextFollowUpDate: Date
}

export type NewLeadInput = {
  email: string
  fullName: string
  phoneNumber: string
  leadSource: string
  interestedVenue: string
  assignedSalesConsultant: string
  lastContactDate: Date | null
  nextFollowUpDate: Date
}

export type LeadConflict = {
  email: boolean
  phoneNumber: boolean
}

const ACTIVE_LEAD_STATUSES: LeadStatus[] = ["pending", "processing"]

export function isLeadStatus(value: unknown): value is LeadStatus {
  return (
    typeof value === "string" &&
    (LEAD_STATUSES as readonly string[]).includes(value)
  )
}

export function isActiveLeadStatus(status: LeadStatus): boolean {
  return ACTIVE_LEAD_STATUSES.includes(status)
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function normalizePhoneNumber(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "")

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`
  }

  return digits
}

export function findLeadConflict(
  leads: Lead[],
  input: Pick<NewLeadInput, "email" | "phoneNumber">
): LeadConflict {
  const email = normalizeEmail(input.email)
  const phoneNumber = normalizePhoneNumber(input.phoneNumber)

  return leads.reduce<LeadConflict>(
    (conflict, lead) => {
      if (!isActiveLeadStatus(lead.status)) {
        return conflict
      }

      if (!conflict.email && normalizeEmail(lead.email) === email) {
        conflict.email = true
      }

      if (
        !conflict.phoneNumber &&
        normalizePhoneNumber(lead.phoneNumber) === phoneNumber
      ) {
        conflict.phoneNumber = true
      }

      return conflict
    },
    { email: false, phoneNumber: false }
  )
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return null
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function reviveLead(value: unknown): Lead | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const lead = value as Record<string, unknown>
  const {
    id,
    status,
    email,
    fullName,
    phoneNumber,
    leadSource,
    interestedVenue,
    assignedSalesConsultant,
  } = lead
  const creationDate = toDate(lead.creationDate)
  const nextFollowUpDate = toDate(lead.nextFollowUpDate)
  const lastContactDate =
    lead.lastContactDate == null ? null : toDate(lead.lastContactDate)

  if (
    typeof id !== "string" ||
    !isLeadStatus(status) ||
    typeof email !== "string" ||
    typeof fullName !== "string" ||
    typeof phoneNumber !== "string" ||
    typeof leadSource !== "string" ||
    typeof interestedVenue !== "string" ||
    typeof assignedSalesConsultant !== "string" ||
    creationDate === null ||
    nextFollowUpDate === null
  ) {
    return null
  }

  return {
    id,
    status,
    email,
    fullName,
    phoneNumber,
    leadSource,
    interestedVenue,
    assignedSalesConsultant,
    creationDate,
    lastContactDate,
    nextFollowUpDate,
  }
}
