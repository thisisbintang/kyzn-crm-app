import { IconArrowLeft, IconCopy } from "@tabler/icons-react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { type VariantProps } from "class-variance-authority"
import { format } from "date-fns"
import { type ReactNode } from "react"

import { Badge, badgeVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/toast"

import { getLeadStatusLabel } from "../-data"
import { type Lead, type LeadStatus, findLeadById } from "../-lead"
import { useLeadStore } from "../-lead-store"

export const Route = createFileRoute("/leads/$uuid/detail")({
  component: RouteComponent,
})

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

const STATUS_BADGE_VARIANTS: Record<LeadStatus, BadgeVariant> = {
  pending: "outline",
  processing: "default",
  success: "secondary",
  failed: "destructive",
}

function formatDate(date: Date): string {
  return format(date, "dd MMM yyyy")
}

function DetailItem({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  )
}

function BackToLeadsButton() {
  return (
    <Button render={<Link to="/leads" />}>
      <IconArrowLeft />
      Back to Leads
    </Button>
  )
}

function CopyLeadIdButton({ leadId }: { leadId: string }) {
  function copyLeadId() {
    void navigator.clipboard.writeText(leadId)
    toast.add({
      title: "Lead ID copied",
      type: "success",
    })
  }

  return (
    <Button type="button" variant="ghost" size="icon-sm" onClick={copyLeadId}>
      <IconCopy />
      <span className="sr-only">Copy lead ID</span>
    </Button>
  )
}

function LeadDetailCard({ lead }: { lead: Lead }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{lead.fullName}</CardTitle>
        <CardDescription>{lead.email}</CardDescription>
        <CardAction>
          <Badge variant={STATUS_BADGE_VARIANTS[lead.status]}>
            {getLeadStatusLabel(lead.status)}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Contact</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Email">{lead.email}</DetailItem>
            <DetailItem label="Phone Number">{lead.phoneNumber}</DetailItem>
          </dl>
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Lead details</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Lead Source">{lead.leadSource}</DetailItem>
            <DetailItem label="Interested Venue">
              {lead.interestedVenue}
            </DetailItem>
            <DetailItem label="Assigned Sales Consultant">
              {lead.assignedSalesConsultant}
            </DetailItem>
            <DetailItem label="Lead ID">
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs break-all">{lead.id}</span>
                <CopyLeadIdButton leadId={lead.id} />
              </div>
            </DetailItem>
          </dl>
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Dates</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Creation Date">
              {formatDate(lead.creationDate)}
            </DetailItem>
            <DetailItem label="Last Contact Date">
              {lead.lastContactDate ? (
                formatDate(lead.lastContactDate)
              ) : (
                <span className="font-normal text-muted-foreground">
                  Not contacted yet
                </span>
              )}
            </DetailItem>
            <DetailItem label="Next Follow-Up Date">
              {formatDate(lead.nextFollowUpDate)}
            </DetailItem>
          </dl>
        </section>
      </CardContent>
    </Card>
  )
}

function LeadNotFound() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead not found</CardTitle>
        <CardDescription>
          This lead may have been removed, or the link is no longer valid.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

function RouteComponent() {
  const { uuid } = Route.useParams()
  const leads = useLeadStore((state) => state.leads)
  const lead = findLeadById(leads, uuid)

  return (
    <div className="flex flex-col gap-4 p-4">
      <BackToLeadsButton />
      {lead ? <LeadDetailCard lead={lead} /> : <LeadNotFound />}
    </div>
  )
}
