'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export type DateRangePreset = 'heute' | 'diese-woche' | 'dieser-monat' | 'custom';

interface DateRange {
  from: Date;
  to: Date;
  preset: DateRangePreset;
}

interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: (from: Date, to: Date, preset?: DateRangePreset) => void;
  setPreset: (preset: DateRangePreset) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const [dateRange, setDateRangeState] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
    preset: 'heute',
  });

  const setDateRange = useCallback((from: Date, to: Date, preset: DateRangePreset = 'custom') => {
    const newFrom = startOfDay(from);
    const newTo = endOfDay(to);

    console.log('📅 DateRangeContext: setDateRange called', {
      from: newFrom.toISOString().split('T')[0],
      to: newTo.toISOString().split('T')[0],
      preset,
      fromTimestamp: newFrom.getTime(),
      toTimestamp: newTo.getTime()
    });

    setDateRangeState({
      from: newFrom,
      to: newTo,
      preset,
    });
  }, []);

  const setPreset = useCallback((preset: DateRangePreset) => {
    const now = new Date();
    let from: Date;
    let to: Date;

    switch (preset) {
      case 'heute':
        from = startOfDay(now);
        to = endOfDay(now);
        break;
      case 'diese-woche':
        from = startOfWeek(now, { weekStartsOn: 1 });
        to = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'dieser-monat':
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      default:
        return;
    }

    console.log('📅 DateRangeContext: setPreset called', {
      preset,
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
      fromTimestamp: from.getTime(),
      toTimestamp: to.getTime()
    });

    setDateRangeState({ from, to, preset });
  }, []);

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange, setPreset }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
}
