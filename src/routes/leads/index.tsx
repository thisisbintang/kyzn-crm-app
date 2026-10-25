import { createFileRoute } from "@tanstack/react-router"

import { columns } from "./-columns"
import { DataTable } from "./-data-table"
import { useLeadStore } from "./-lead-store"

export const Route = createFileRoute("/leads/")({
  component: RouteComponent,
  staticData: { title: "Leads" },
})

function RouteComponent() {
  const leads = useLeadStore((state) => state.leads)

  return (
    <div className="px-6">
      <DataTable columns={columns} data={leads} />
    </div>
  )
}
