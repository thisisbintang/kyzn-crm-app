import { createFileRoute } from "@tanstack/react-router"

import { MetricCards } from "@/components/metric-cards"

export const Route = createFileRoute("/")({
  component: Index,
  staticData: { title: "Dashboard" },
})

function Index() {
  return (
    <>
      <MetricCards />
    </>
  )
}
