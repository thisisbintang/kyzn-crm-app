import { getLeadMetrics } from "@/routes/leads/-lead-metrics"
import { useLeadStore } from "@/routes/leads/-lead-store"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function MetricCards() {
  const leads = useLeadStore((state) => state.leads)
  const now = new Date()
  const metrics = getLeadMetrics(leads, now)
  const dueToday = metrics.followUpsDue - metrics.overdueFollowUps

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <MetricCard
        title="Total Leads"
        value={metrics.total}
        footer={`${metrics.active} active, ${metrics.closed} closed`}
      />
      <MetricCard
        title="Pending Leads"
        value={metrics.pending}
        badge={formatShare(metrics.pending, metrics.total)}
        footer="Not contacted yet"
      />
      <MetricCard
        title="Processing Leads"
        value={metrics.processing}
        badge={formatShare(metrics.processing, metrics.total)}
        footer="Follow-up in progress"
      />
      <MetricCard
        title="Success Leads"
        value={metrics.success}
        badge={formatShare(metrics.success, metrics.total)}
        footer="Converted to members"
      />
      <MetricCard
        title="Failed Leads"
        value={metrics.failed}
        badge={formatShare(metrics.failed, metrics.total)}
        footer="Lost, will not convert"
      />
      <MetricCard
        title="New This Month"
        value={metrics.newThisMonth}
        badge={formatShare(metrics.newThisMonth, metrics.total)}
        footer={`Created in ${format(now, "MMMM yyyy")}`}
      />
      <MetricCard
        title="Follow-Ups Due"
        value={metrics.followUpsDue}
        badge={formatShare(metrics.followUpsDue, metrics.active)}
        footer={
          metrics.followUpsDue === 0
            ? "No follow-ups due"
            : `${metrics.overdueFollowUps} overdue, ${dueToday} due today`
        }
      />
      <MetricCard
        title="Conversion Rate"
        value={`${Math.round(metrics.conversionRate * 100)}%`}
        footer={
          metrics.closed === 0
            ? "No closed leads yet"
            : `${metrics.success} converted from ${metrics.closed} closed leads`
        }
      />
    </div>
  )
}

function formatShare(count: number, base: number): string | undefined {
  if (base === 0) {
    return undefined
  }

  return `${Math.round((count / base) * 100)}%`
}

function MetricCard(props: {
  title: string
  value: string | number
  badge?: string
  footer: string
}) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{props.title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {props.value}
        </CardTitle>
        {props.badge ? (
          <CardAction>
            <Badge variant="outline">{props.badge}</Badge>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">{props.footer}</div>
      </CardFooter>
    </Card>
  )
}
