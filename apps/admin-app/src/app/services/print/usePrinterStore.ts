import { create } from 'zustand';
import * as UsbPrinter from './UsbPrinterDriver';
import type { PrinterDevice } from './UsbPrinterDriver';

interface PrinterState {
  device: PrinterDevice | null;
  connecting: boolean;
  error: string | null;

  /** Connect to a USB printer (opens browser device picker) */
  connect: () => Promise<void>;
  /** Reconnect to a previously paired device (no dialog) */
  reconnect: () => Promise<void>;
  /** Disconnect from the current printer */
  disconnect: () => Promise<void>;
  /** Clear any error messages */
  clearError: () => void;
}

export const usePrinterStore = create<PrinterState>((set) => ({
  device: null,
  connecting: false,
  error: null,

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
}));
