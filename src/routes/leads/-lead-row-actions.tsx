import { IconDots } from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"
import * as React from "react"

import { LeadFormDialog } from "@/components/lead-form-dialog"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { type Lead } from "./-lead"
import { LeadStatusRadioGroup } from "./-lead-status-menu"

type LeadRowActionsProps = {
  lead: Lead
}

export function LeadRowActions({ lead }: LeadRowActionsProps) {
  const [isEditOpen, setIsEditOpen] = React.useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <span className="sr-only">Open menu</span>
          <IconDots />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(lead.id)}
            >
              Copy lead ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
              Edit lead
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <LeadStatusRadioGroup lead={lead} />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={
                <Link to="/leads/$uuid/detail" params={{ uuid: lead.id }} />
              }
            >
              View lead details
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <LeadFormDialog
          lead={lead}
          open={isEditOpen}
          onSubmitted={() => setIsEditOpen(false)}
        />
      </Dialog>
    </>
  )
}
