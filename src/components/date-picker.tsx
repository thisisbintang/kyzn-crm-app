import type { PopoverTriggerProps } from "@base-ui/react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker(
  props: {
    date?: Date
    onSelectDate: (date: Date | undefined) => void
  } & Pick<PopoverTriggerProps, "id">
) {
  return (
    <Popover>
      <PopoverTrigger
        id={props.id}
        render={
          <Button
            variant="outline"
            data-empty={!props.date}
            className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
          />
        }
      >
        <CalendarIcon />
        {props.date ? format(props.date, "PPP") : <span>Pick a date</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={props.date}
          onSelect={(value) => props.onSelectDate(value)}
        />
      </PopoverContent>
    </Popover>
  )
}
