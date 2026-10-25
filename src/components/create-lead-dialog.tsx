import {
  ASSIGNED_SALES_CONSULTANTS_ITEMS,
  INTERESTED_VENUES_ITEMS,
  LEAD_SOURCES_ITEMS,
} from "@/routes/leads/-data"
import { type LeadFormValues, leadFormSchema } from "@/routes/leads/-lead-form"
import { useLeadStore } from "@/routes/leads/-lead-store"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"

import { DatePicker } from "./date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

type CreateLeadDialogProps = {
  onCreated?: () => void
}

export const CreateLeadDialog = ({ onCreated }: CreateLeadDialogProps) => {
  const addLead = useLeadStore((state) => state.addLead)
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      leadSource: "",
      interestedVenue: "",
      assignedSalesConsultant: "",
      lastContactDate: undefined,
      nextFollowUpDate: undefined,
    },
  })

  function onSubmit(data: LeadFormValues) {
    const result = addLead({
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      leadSource: data.leadSource,
      interestedVenue: data.interestedVenue,
      assignedSalesConsultant: data.assignedSalesConsultant,
      lastContactDate: data.lastContactDate ?? null,
      nextFollowUpDate: data.nextFollowUpDate,
    })

    if (!result.ok) {
      if (result.errors.email) {
        form.setError("email", {
          type: "validate",
          message: result.errors.email,
        })
      } else {
        form.clearErrors("email")
      }

      if (result.errors.phoneNumber) {
        form.setError("phoneNumber", {
          type: "validate",
          message: result.errors.phoneNumber,
        })
      } else {
        form.clearErrors("phoneNumber")
      }

      return
    }

    toast.add({
      title: "Lead created",
      description: `${result.lead.fullName} has been added to your leads.`,
      type: "success",
    })
    form.reset()
    onCreated?.()
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Lead</DialogTitle>
        <DialogDescription>
          Fill in the details below to create a new lead.
        </DialogDescription>
      </DialogHeader>

      <form id="form-lead" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="fullName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-lead-fullName">Full Name</FieldLabel>
                <Input
                  {...field}
                  id="form-lead-fullName"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter full name"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="phoneNumber"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-lead-phoneNumber">
                  Phone Number
                </FieldLabel>
                <Input
                  {...field}
                  id="form-lead-phoneNumber"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter phone number"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-lead-email">Email Address</FieldLabel>
                <Input
                  {...field}
                  id="form-lead-email"
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter email address"
                  autoComplete="email"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="leadSource"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-lead-leadSource">
                  Lead Source
                </FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="form-lead-leadSource"
                    aria-invalid={fieldState.invalid}
                    className="min-w-30"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES_ITEMS.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="interestedVenue"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-lead-interestedVenue">
                  Interested Venue
                </FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="form-lead-interestedVenue"
                    aria-invalid={fieldState.invalid}
                    className="min-w-30"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERESTED_VENUES_ITEMS.map((venue) => (
                      <SelectItem key={venue.value} value={venue.value}>
                        {venue.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="assignedSalesConsultant"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-lead-assignedSalesConsultant">
                  Assigned Sales Consultant
                </FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="form-lead-assignedSalesConsultant"
                    aria-invalid={fieldState.invalid}
                    className="min-w-30"
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNED_SALES_CONSULTANTS_ITEMS.map((consultant) => (
                      <SelectItem
                        key={consultant.value}
                        value={consultant.value}
                      >
                        {consultant.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="lastContactDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-lead-lastContactDate">
                  Last Contact Date
                </FieldLabel>
                <DatePicker
                  id="form-lead-lastContactDate"
                  onSelectDate={(date) => {
                    form.setValue("lastContactDate", date, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }}
                  date={field.value}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="nextFollowUpDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-lead-nextFollowUpDate">
                  Next Follow-Up Date
                </FieldLabel>
                <DatePicker
                  id="form-lead-nextFollowUpDate"
                  onSelectDate={(date) => {
                    if (!date) return
                    form.setValue("nextFollowUpDate", date, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }}
                  date={field.value}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>

      <DialogFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="form-lead">
            Submit
          </Button>
        </Field>
      </DialogFooter>
    </DialogContent>
  )
}
