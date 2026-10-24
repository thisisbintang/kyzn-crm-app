import { IconTrendingUp } from "@tabler/icons-react"

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from "./ui/badge"

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <MetricCard description="Total Leads" amount={10} />
      <MetricCard description="New Leads" amount={12} />
      <MetricCard description="Follow Up" amount={5} />
      <MetricCard description="Trials Scheduled" amount={8} />
      <MetricCard description="Trials Completed" amount={6} />
      <MetricCard description="Paid Members" amount={15} />
      <MetricCard description="Conversion Rates" amount={75} />
    </div>
  )
}

function MetricCard(props: { description: string; amount: number }) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{props.description}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {props.amount}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <IconTrendingUp />
            +12.5%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Trending up this month <IconTrendingUp className="size-4" />
        </div>
        <div className="text-muted-foreground">
          Visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
