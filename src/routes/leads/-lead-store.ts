import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import {
  type Lead,
  type NewLeadInput,
  findLeadConflict,
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

type LeadState = {
  leads: Lead[]
  addLead: (input: NewLeadInput) => AddLeadResult
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
