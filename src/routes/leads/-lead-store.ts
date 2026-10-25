import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import {
  type Lead,
  type LeadConflict,
  type LeadStatus,
  type NewLeadInput,
  canTransitionLeadStatus,
  findLeadById,
  findLeadConflict,
  isActiveLeadStatus,
  reviveLead,
} from "./-lead"

export const LEADS_STORAGE_KEY = "kyzn-crm:leads"

export type AddLeadResult =
  | { ok: true; lead: Lead }
  | {
      ok: false
      errors: {
        email?: string
        phoneNumber?: string
      }
    }

export type ChangeLeadStatusResult =
  | { ok: true; lead: Lead }
  | {
      ok: false
      reason: "not-found" | "invalid-transition" | "conflict"
      conflict?: LeadConflict
    }

type LeadState = {
  leads: Lead[]
  addLead: (input: NewLeadInput) => AddLeadResult
  changeLeadStatus: (id: string, status: LeadStatus) => ChangeLeadStatusResult
}

function createLead(input: NewLeadInput): Lead {
  return {
    id: crypto.randomUUID(),
    status: "pending",
    email: input.email.trim(),
    fullName: input.fullName.trim(),
    phoneNumber: input.phoneNumber.trim(),
    leadSource: input.leadSource,
    interestedVenue: input.interestedVenue,
    assignedSalesConsultant: input.assignedSalesConsultant,
    creationDate: new Date(),
    lastContactDate: input.lastContactDate,
    nextFollowUpDate: input.nextFollowUpDate,
  }
}

export const useLeadStore = create<LeadState>()(
  persist(
    (set, get) => ({
      leads: [],
      addLead: (input) => {
        const conflict = findLeadConflict(get().leads, input)

        if (conflict.email || conflict.phoneNumber) {
          return {
            ok: false,
            errors: {
              ...(conflict.email
                ? { email: "A lead with this email already exists." }
                : {}),
              ...(conflict.phoneNumber
                ? {
                    phoneNumber:
                      "A lead with this phone number already exists.",
                  }
                : {}),
            },
          }
        }

        const lead = createLead(input)
        set((state) => ({ leads: [lead, ...state.leads] }))

        return { ok: true, lead }
      },
      changeLeadStatus: (id, status) => {
        const lead = findLeadById(get().leads, id)

        if (!lead) {
          return { ok: false, reason: "not-found" }
        }

        if (lead.status === status) {
          return { ok: true, lead }
        }

        if (!canTransitionLeadStatus(lead.status, status)) {
          return { ok: false, reason: "invalid-transition" }
        }

        if (isActiveLeadStatus(status)) {
          const conflict = findLeadConflict(get().leads, lead, lead.id)

          if (conflict.email || conflict.phoneNumber) {
            return { ok: false, reason: "conflict", conflict }
          }
        }

        const updatedLead: Lead = {
          ...lead,
          status,
          lastContactDate:
            lead.lastContactDate === null &&
            (status === "processing" || status === "success")
              ? new Date()
              : lead.lastContactDate,
        }

        set((state) => ({
          leads: state.leads.map((item) =>
            item.id === id ? updatedLead : item
          ),
        }))

        return { ok: true, lead: updatedLead }
      },
    }),
    {
      name: LEADS_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ leads: state.leads }),
      merge: (persistedState, currentState) => {
        const persistedLeads = (persistedState as { leads?: unknown })?.leads
        const leads = Array.isArray(persistedLeads)
          ? persistedLeads
              .map(reviveLead)
              .filter((lead): lead is Lead => lead !== null)
          : []

        return { ...currentState, leads }
      },
    }
  )
)
