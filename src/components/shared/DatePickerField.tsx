import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { srLatn } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerFieldProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const toDate = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export function DatePickerField({
  value,
  onChange,
  placeholder = 'Izaberi datum',
  disabled = false,
  className,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => toDate(value), [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-10 w-full justify-between rounded-lg border-border/70 bg-background/80 px-3 text-left font-normal shadow-sm hover:bg-accent/60',
            !selectedDate && 'text-muted-foreground',
            className,
          )}
        >
          <span className="flex items-center gap-2 overflow-hidden">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span className="truncate">
              {selectedDate ? format(selectedDate, 'dd. MMMM yyyy.', { locale: srLatn }) : placeholder}
            </span>
          </span>
          {selectedDate ? (
            <span
              role="button"
              tabIndex={0}
              className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onChange('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  onChange('');
                }
              }}
            >
              <X className="h-4 w-4" />
            </span>
          ) : (
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-2xl border-border/70 bg-popover/95 p-0 shadow-xl backdrop-blur">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) {
              return;
            }

            onChange(format(date, 'yyyy-MM-dd'));
            setOpen(false);
          }}
          initialFocus
          className="rounded-2xl"
          classNames={{
            months: 'flex flex-col gap-4 p-4',
            month: 'space-y-4',
            caption: 'flex items-center justify-between px-1 pt-1',
            caption_label: 'text-sm font-semibold tracking-tight',
            nav: 'flex items-center gap-1',
            nav_button: 'h-8 w-8 rounded-full border border-border/60 bg-background/70 p-0 text-foreground opacity-100 hover:bg-accent',
            nav_button_previous: 'static',
            nav_button_next: 'static',
            head_row: 'flex justify-between',
            head_cell: 'w-9 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-muted-foreground',
            row: 'mt-2 flex w-full justify-between',
            cell: 'h-9 w-9 p-0 text-center text-sm',
            day: 'h-9 w-9 rounded-full p-0 font-medium hover:bg-accent',
            day_selected: 'bg-primary text-primary-foreground hover:bg-primary',
            day_today: 'bg-accent text-accent-foreground ring-1 ring-border',
          }}
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
