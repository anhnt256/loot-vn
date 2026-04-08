import { create } from 'zustand';

import * as UsbPrinter from './UsbPrinterDriver';
import type { PrinterDevice } from './UsbPrinterDriver';

export type PrintMode = 'usb' | 'system';

const PRINT_MODE_KEY = 'loot_print_mode';

function loadPrintMode(): PrintMode {
  try {
    const v = localStorage.getItem(PRINT_MODE_KEY);
    return v === 'system' ? 'system' : 'usb';
  } catch {
    return 'usb';
  }
}

interface PrinterState {
  device: PrinterDevice | null;
  connecting: boolean;
  error: string | null;
  printMode: PrintMode;

  /** Connect to a USB printer (opens browser device picker) */
  connect: () => Promise<void>;
  /** Reconnect to a previously paired device (no dialog) */
  reconnect: () => Promise<void>;
  /** Disconnect from the current printer */
  disconnect: () => Promise<void>;
  /** Clear any error messages */
  clearError: () => void;
  /** Switch between USB and System print mode */
  setPrintMode: (mode: PrintMode) => void;
}

export const usePrinterStore = create<PrinterState>((set) => ({
  device: null,
  connecting: false,
  error: null,
  printMode: loadPrintMode(),

  connect: async () => {
    set({ connecting: true, error: null });
    try {
      const device = await UsbPrinter.connect();
      set({ device, connecting: false });
    } catch (err: any) {
      set({ connecting: false, error: err.message });
      throw err;
    }
  },

  reconnect: async () => {
    try {
      const device = await UsbPrinter.reconnect();
      if (device) {
        set({ device });
      }
    } catch {
      // Silent reconnect failure is OK
    }
  },

  disconnect: async () => {
    await UsbPrinter.disconnect();
    set({ device: null });
  },

  clearError: () => set({ error: null }),

  setPrintMode: (mode) => {
    localStorage.setItem(PRINT_MODE_KEY, mode);
    if (mode === 'system') {
      UsbPrinter.disconnect();
      set({ printMode: mode, device: null, error: null });
    } else {
      set({ printMode: mode, error: null });
    }
  },
}));
