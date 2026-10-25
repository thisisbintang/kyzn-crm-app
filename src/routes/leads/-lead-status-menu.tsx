import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/toast"

import { getLeadStatusLabel } from "./-data"
import {
  LEAD_STATUSES,
  type Lead,
  canTransitionLeadStatus,
  isLeadStatus,
} from "./-lead"
import { useLeadStore } from "./-lead-store"

type LeadStatusRadioGroupProps = {
  lead: Lead
}

export function LeadStatusRadioGroup({ lead }: LeadStatusRadioGroupProps) {
  const changeLeadStatus = useLeadStore((state) => state.changeLeadStatus)

  function handleStatusChange(value: unknown) {
    if (!isLeadStatus(value) || value === lead.status) {
      return
    }

    const result = changeLeadStatus(lead.id, value)

    if (!result.ok) {
      toast.add({
        title: "Status not changed",
        description:
          result.reason === "conflict"
            ? "Another active lead already uses this email or phone number."
            : "This lead can no longer be updated.",
        type: "error",
      })
      return
    }

    toast.add({
      title: `Status changed to ${getLeadStatusLabel(value)}`,
      type: "success",
    })
  }

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>Status</DropdownMenuLabel>
      <DropdownMenuRadioGroup
        value={lead.status}
        onValueChange={handleStatusChange}
      >
        {LEAD_STATUSES.map((status) => (
          <DropdownMenuRadioItem
            key={status}
            value={status}
            disabled={
              status !== lead.status &&
              !canTransitionLeadStatus(lead.status, status)
            }
          >
            {getLeadStatusLabel(status)}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuGroup>
  )
}
