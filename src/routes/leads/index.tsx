import { faker } from "@faker-js/faker"
import { createFileRoute } from "@tanstack/react-router"

import { type Lead, columns } from "./-columns"
import { ASSIGNED_SALES_CONSULTANS, LEAD_SOURCES, STATUSES } from "./-data"
import { DataTable } from "./-data-table"

function generatePayment(): Lead {
  return {
    id: faker.string.uuid(),
    status: faker.helpers.arrayElement(STATUSES),
    email: faker.internet.email(),
    assignedSalesConsultant: faker.helpers.arrayElement(
      ASSIGNED_SALES_CONSULTANS
    ),
    fullName: faker.person.fullName(),
    phoneNumber: faker.phone.number(),
    leadSource: faker.helpers.arrayElement(LEAD_SOURCES),
    interestedVenue: faker.company.name(),
    creationDate: faker.date.past(),
    lastContactDate: faker.date.past(),
    nextFollowUpDate: faker.date.future(),
  }
}

export const Route = createFileRoute("/leads/")({
  component: RouteComponent,
  loader: async () => {
    return Array.from({ length: 100 }, () => generatePayment())
  },
})

function RouteComponent() {
  const payments = Route.useLoaderData()

  return (
    <>
      <DataTable columns={columns} data={payments} />
    </>
  )
}
