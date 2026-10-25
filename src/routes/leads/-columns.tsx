import { IconArrowNarrowDown, IconDots } from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

import { LEAD_STATUS_BADGE_VARIANTS, getLeadStatusLabel } from "./-data"
import { type DataTableFeatures } from "./-data-table-features"
import { type Lead } from "./-lead"
import { LeadStatusRadioGroup } from "./-lead-status-menu"

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Lead>()

export const columns = columnHelper.columns([
  columnHelper.accessor("email", {
    header: "Email",
  }),
  columnHelper.accessor("fullName", {
    header: "Full Name",
  }),
  columnHelper.accessor("phoneNumber", {
    header: "Phone Number",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue()

      return (
        <Badge variant={LEAD_STATUS_BADGE_VARIANTS[status]}>
          {getLeadStatusLabel(status)}
        </Badge>
      )
    },
  }),
  columnHelper.accessor("leadSource", {
    header: "Lead Source",
  }),
  columnHelper.accessor("assignedSalesConsultant", {
    header: "Assigned Sales Consultant",
  }),
  columnHelper.accessor("creationDate", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Creation Date
        <IconArrowNarrowDown data-icon="inline-end" />
      </Button>
    ),
    cell: ({ getValue }) => format(getValue(), "dd MMM yyyy"),
    sortFn: "datetime",
  }),
  columnHelper.accessor("nextFollowUpDate", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Next Follow Up Date
        <IconArrowNarrowDown data-icon="inline-end" />
      </Button>
    ),
    cell: ({ getValue }) => format(getValue(), "dd MMM yyyy"),
    sortFn: "datetime",
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      const lead = row.original

      return (
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
      )
    },
  }),
])
