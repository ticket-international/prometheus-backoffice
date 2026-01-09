'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useDateRange, DateRangePreset } from '@/lib/DateRangeContext';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DateRangePicker() {
  const { dateRange, setDateRange, setPreset } = useDateRange();
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({
    from: dateRange.from,
    to: dateRange.to,
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setTempRange({ from: dateRange.from, to: dateRange.to });
    }
  };

  const presetButtons: { label: string; value: DateRangePreset }[] = [
    { label: 'Heute', value: 'heute' },
    { label: 'Diese Woche', value: 'diese-woche' },
    { label: 'Dieser Monat', value: 'dieser-monat' },
  ];

  const handlePresetClick = (preset: DateRangePreset) => {
    console.log('🗓️ DateRangePicker: Preset clicked:', preset);
    setPreset(preset);
    setOpen(false);
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;

    setTempRange(range);

    if (range.from && range.to) {
      console.log('🗓️ DateRangePicker: Custom range selected:', {
        from: range.from.toISOString().split('T')[0],
        to: range.to.toISOString().split('T')[0]
      });
      setDateRange(range.from, range.to, 'custom');
      setOpen(false);
    } else if (range.from && !range.to) {
      console.log('🗓️ DateRangePicker: Single date selected:', range.from.toISOString().split('T')[0]);
      const updatedRange = { from: range.from, to: range.from };
      setTempRange(updatedRange);
      setDateRange(range.from, range.from, 'custom');
      setOpen(false);
    }
  };

  const getDisplayText = () => {
    switch (dateRange.preset) {
      case 'heute':
        return 'Heute';
      case 'diese-woche':
        return 'Diese Woche';
      case 'dieser-monat':
        return 'Dieser Monat';
      case 'custom':
        if (dateRange.from.getTime() === dateRange.to.getTime()) {
          return format(dateRange.from, 'dd.MM.yyyy', { locale: de });
        }
        return `${format(dateRange.from, 'dd.MM.yyyy', { locale: de })} - ${format(dateRange.to, 'dd.MM.yyyy', { locale: de })}`;
      default:
        return 'Heute';
    }
  };

  const getSecondaryText = () => {
    if (dateRange.preset === 'custom') {
      return null;
    }

    if (dateRange.from.getTime() === dateRange.to.getTime()) {
      return format(dateRange.from, 'dd.MM.yyyy', { locale: de });
    }
    return `${format(dateRange.from, 'dd.MM.yyyy', { locale: de })} - ${format(dateRange.to, 'dd.MM.yyyy', { locale: de })}`;
  };

  const secondaryText = getSecondaryText();

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">Zeitraum</span>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'inline-flex items-center gap-2 rounded-md border border-border bg-popover px-3 py-1.5 text-xs shadow-sm hover:bg-accent',
              open && 'ring-2 ring-ring ring-offset-2'
            )}
          >
            <span>{getDisplayText()}</span>
            {secondaryText && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{secondaryText}</span>
              </>
            )}
            <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex">
            <div className="flex flex-col gap-1 border-r border-border p-3">
              {presetButtons.map((preset) => (
                <Button
                  key={preset.value}
                  variant={dateRange.preset === preset.value ? 'default' : 'ghost'}
                  size="sm"
                  className="justify-start"
                  onClick={() => handlePresetClick(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="p-3">
              <Calendar
                mode="range"
                selected={{
                  from: tempRange.from,
                  to: tempRange.to,
                }}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                locale={de}
                defaultMonth={dateRange.from}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
