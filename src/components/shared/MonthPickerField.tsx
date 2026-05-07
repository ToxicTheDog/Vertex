import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { srLatn } from 'date-fns/locale';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MonthPickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  max?: string;
  minYear?: number;
  className?: string;
}

const monthLabels = Array.from({ length: 12 }, (_, index) =>
  format(new Date(2026, index, 1), 'LLLL', { locale: srLatn }),
);

const monthValueToDate = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, 1);
};

export function MonthPickerField({
  value,
  onChange,
  max,
  minYear = 2020,
  className,
}: MonthPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => monthValueToDate(value), [value]);
  const maxDate = useMemo(() => (max ? monthValueToDate(max) : undefined), [max]);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());

  const years = [];
  const upperYear = maxDate ? maxDate.getFullYear() : new Date().getFullYear() + 1;
  for (let year = upperYear; year >= minYear; year -= 1) {
    years.push(year);
  }

  return (
    <Popover open={open} onOpenChange={(nextOpen) => {
      setOpen(nextOpen);
      if (nextOpen) {
        setViewYear(selectedDate.getFullYear());
      }
    }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-10 w-full justify-between rounded-lg border-border/70 bg-background/80 px-3 text-left font-normal shadow-sm hover:bg-accent/60',
            className,
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-primary" />
            <span>{format(selectedDate, 'LLLL yyyy.', { locale: srLatn })}</span>
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Mesec
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] rounded-2xl border-border/70 bg-popover/95 p-4 shadow-xl backdrop-blur">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => setViewYear((year) => year - 1)}
              disabled={viewYear <= minYear}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">Izaberi period</p>
              <p className="text-lg font-semibold">{viewYear}.</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => setViewYear((year) => year + 1)}
              disabled={Boolean(maxDate && viewYear >= maxDate.getFullYear())}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {monthLabels.map((label, index) => {
              const monthNumber = String(index + 1).padStart(2, '0');
              const monthValue = `${viewYear}-${monthNumber}`;
              const isSelected = monthValue === value;
              const isDisabled = Boolean(max && monthValue > max);

              return (
                <Button
                  key={monthValue}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'h-12 rounded-xl border-border/60 text-sm capitalize shadow-sm',
                    !isSelected && 'bg-background/60 hover:bg-accent/70',
                  )}
                  disabled={isDisabled}
                  onClick={() => {
                    onChange(monthValue);
                    setOpen(false);
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-3 py-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Godina</span>
            <select
              value={viewYear}
              onChange={(event) => setViewYear(Number(event.target.value))}
              className="rounded-md border border-border/60 bg-background px-2 py-1 text-sm text-foreground outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
