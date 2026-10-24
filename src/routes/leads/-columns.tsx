import { IconArrowNarrowDown, IconDots } from "@tabler/icons-react"
import { createColumnHelper } from "@tanstack/react-table"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { type DataTableFeatures } from "./-data-table-features"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Lead = {
  id: string
  status: "pending" | "processing" | "success" | "failed"
  email: string
  fullName: string
  phoneNumber: string
  leadSource: string
  interestedVenue: string
  assignedSalesConsultant: string
  creationDate: Date
  lastContactDate: Date
  nextFollowUpDate: Date
}

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
        <IconArrowNarrowDown className="ml-2 h-4 w-4" />
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
        <IconArrowNarrowDown className="ml-2 h-4 w-4" />
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
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="h-8 w-8 p-0" />}
          >
            <span className="sr-only">Open menu</span>
            <IconDots className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(lead.id)}
              >
                Copy lead ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View lead details</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }),
])
