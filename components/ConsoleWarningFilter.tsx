'use client';

import { useEffect } from 'react';

export function ConsoleWarningFilter() {
  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || '';

      if (
        message.includes('defaultProps') ||
        message.includes('Support for defaultProps will be removed')
      ) {
        return;
      }

      originalWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';

      if (
        message.includes('defaultProps') ||
        message.includes('Support for defaultProps will be removed') ||
        (message.includes('webpack-internal') && message.includes('PREVIEW_CONSOLE_ERROR'))
      ) {
        return;
      }

      originalError.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return null;
}
