import type { LeadStatus } from "./-lead"

export const STATUSES: LeadStatus[] = [
  "failed",
  "pending",
  "processing",
  "success",
]

export const ASSIGNED_SALES_CONSULTANTS = [
  "John Doe",
  "Jane Smith",
  "Michael Johnson",
  "Emily Davis",
  "David Wilson",
]

export const LEAD_SOURCES = [
  "Website",
  "Social Media",
  "Referral",
  "Event",
  "Advertisement",
]

const INTERESTED_VENUES = [
  "KYZN Bekasi",
  "KYZN Kuningan",
  "KYZN BSD",
  "KYZN Surabaya",
]

export const LEAD_SOURCES_ITEMS = LEAD_SOURCES.map((source) => ({
  value: source,
  label: source,
}))

export const INTERESTED_VENUES_ITEMS = INTERESTED_VENUES.map((venue) => ({
  value: venue,
  label: venue,
}))

export const ASSIGNED_SALES_CONSULTANTS_ITEMS = ASSIGNED_SALES_CONSULTANTS.map(
  (consultant) => ({
    value: consultant,
    label: consultant,
  })
)

export const STATUS_ITEMS = STATUSES.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}))
