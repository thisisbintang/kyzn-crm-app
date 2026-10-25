import { isSameMonth, startOfDay } from "date-fns"

import { type Lead, isActiveLeadStatus } from "./-lead"

export type LeadMetrics = {
  total: number
  pending: number
  processing: number
  success: number
  failed: number
  active: number
  closed: number
  newThisMonth: number
  followUpsDue: number
  overdueFollowUps: number
  conversionRate: number
}

export function getLeadMetrics(leads: Lead[], now = new Date()): LeadMetrics {
  const startOfToday = startOfDay(now)

  const pending = leads.filter((lead) => lead.status === "pending").length
  const processing = leads.filter((lead) => lead.status === "processing").length
  const success = leads.filter((lead) => lead.status === "success").length
  const failed = leads.filter((lead) => lead.status === "failed").length

  const active = pending + processing
  const closed = success + failed

  const newThisMonth = leads.filter((lead) =>
    isSameMonth(lead.creationDate, now)
  ).length

  const dueFollowUps = leads.filter(
    (lead) =>
      isActiveLeadStatus(lead.status) &&
      startOfDay(lead.nextFollowUpDate).getTime() <= startOfToday.getTime()
  )
  const overdueFollowUps = dueFollowUps.filter(
    (lead) =>
      startOfDay(lead.nextFollowUpDate).getTime() < startOfToday.getTime()
  ).length

  return {
    total: leads.length,
    pending,
    processing,
    success,
    failed,
    active,
    closed,
    newThisMonth,
    followUpsDue: dueFollowUps.length,
    overdueFollowUps,
    conversionRate: closed === 0 ? 0 : success / closed,
  }
}
