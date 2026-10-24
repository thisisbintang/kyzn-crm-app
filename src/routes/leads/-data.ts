import type { Lead } from "./-columns"

export const STATUSES: Lead["status"][] = [
  "failed",
  "pending",
  "processing",
  "success",
]

export const ASSIGNED_SALES_CONSULTANS = [
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

export const LEAD_SOURCES_ITEMS = LEAD_SOURCES.map((source) => ({
  value: source,
  label: source,
}))

export const ASSIGNED_SALES_CONSULTANS_ITEMS = ASSIGNED_SALES_CONSULTANS.map(
  (consultant) => ({
    value: consultant,
    label: consultant,
  })
)

export const STATUS_ITEMS = STATUSES.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}))
