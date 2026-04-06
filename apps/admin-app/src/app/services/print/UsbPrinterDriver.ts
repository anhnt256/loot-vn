/**
 * Web USB API driver for thermal receipt printers (XP-80C and compatible).
 *
 * Flow:
 * 1. requestDevice() — user picks the printer from browser dialog
 * 2. open() + selectConfiguration() + claimInterface()
 * 3. transferOut() — send ESC/POS byte data
 */

export interface PrinterDevice {
  name: string;
  vendorId: number;
  productId: number;
  connected: boolean;
}

// Known thermal printer USB vendor IDs
const THERMAL_PRINTER_FILTERS: USBDeviceFilter[] = [
  { vendorId: 0x0416 }, // Winbond (common for XP-80C)
  { vendorId: 0x1fc9 }, // NXP (some XP-80C variants)
  { vendorId: 0x0483 }, // STMicroelectronics (some thermal printers)
  { vendorId: 0x04b8 }, // Epson
  { vendorId: 0x0dd4 }, // Custom (thermal printers)
  { vendorId: 0x0fe6 }, // ICS (USB-to-serial, common for thermal)
  { vendorId: 0x1a86 }, // QinHeng Electronics (CH340, very common)
  { vendorId: 0x067b }, // Prolific (PL2303, USB-serial)
];

let currentDevice: USBDevice | null = null;

export function isWebUsbSupported(): boolean {
  return typeof navigator !== 'undefined' && 'usb' in navigator;
}

export function isConnected(): boolean {
  return currentDevice !== null && currentDevice.opened;
}

export function getDeviceInfo(): PrinterDevice | null {
  if (!currentDevice) return null;
  return {
    name: currentDevice.productName || 'Thermal Printer',
    vendorId: currentDevice.vendorId,
    productId: currentDevice.productId,
    connected: currentDevice.opened,
  };
}

/**
 * Request and connect to a USB thermal printer.
 * Opens a browser dialog for the user to select the device.
 */
export async function connect(): Promise<PrinterDevice> {
  if (!isWebUsbSupported()) {
    throw new Error(
      'Web USB không được hỗ trợ trên trình duyệt này. Vui lòng sử dụng Chrome/Edge.',
    );
  }

  try {
    // Show device picker — user must actively select
    const device = await navigator.usb.requestDevice({
      filters: THERMAL_PRINTER_FILTERS,
    });

    await openDevice(device);
    currentDevice = device;

    return {
      name: device.productName || 'Thermal Printer',
      vendorId: device.vendorId,
      productId: device.productId,
      connected: true,
    };
  } catch (err: any) {
    if (err.name === 'NotFoundError') {
      throw new Error('Không tìm thấy máy in. Hãy kiểm tra kết nối USB.');
    }
    throw new Error(`Kết nối máy in thất bại: ${err.message}`);
  }
}

/**
 * Try to reconnect to a previously paired device (no dialog needed).
 */
export async function reconnect(): Promise<PrinterDevice | null> {
  if (!isWebUsbSupported()) return null;

  const devices = await navigator.usb.getDevices();
  if (devices.length === 0) return null;

  // Use the first previously paired printer
  const device = devices[0];
  try {
    await openDevice(device);
    currentDevice = device;
    return {
      name: device.productName || 'Thermal Printer',
      vendorId: device.vendorId,
      productId: device.productId,
      connected: true,
    };
  } catch {
    return null;
  }
}

/**
 * Disconnect from the current printer.
 */
export async function disconnect(): Promise<void> {
  if (currentDevice && currentDevice.opened) {
    try {
      await currentDevice.close();
    } catch {
      // Ignore close errors
    }
  }
  currentDevice = null;
}

/**
 * Send raw ESC/POS data to the connected printer.
 */
export async function print(data: Uint8Array): Promise<void> {
  if (!currentDevice || !currentDevice.opened) {
    throw new Error('Máy in chưa được kết nối. Vui lòng kết nối máy in trước.');
  }

  const endpointNumber = findBulkOutEndpoint(currentDevice);
  if (endpointNumber === null) {
    throw new Error('Không tìm thấy endpoint ghi dữ liệu trên máy in.');
  }

  // Send data in chunks to avoid buffer overflow on some printers
  const CHUNK_SIZE = 64;
  for (let offset = 0; offset < data.length; offset += CHUNK_SIZE) {
    const chunk = data.slice(offset, offset + CHUNK_SIZE);
    const result = await currentDevice.transferOut(endpointNumber, chunk);
    if (result.status !== 'ok') {
      throw new Error(`Gửi dữ liệu thất bại tại byte ${offset}: ${result.status}`);
    }
  }
}

/* ─── Internal helpers ─── */

async function openDevice(device: USBDevice): Promise<void> {
  if (!device.opened) {
    await device.open();
  }

  if (device.configuration === null) {
    await device.selectConfiguration(1);
  }

  // Claim the first interface
  const iface = device.configuration!.interfaces[0];
  if (!iface) {
    throw new Error('Không tìm thấy interface trên thiết bị USB.');
  }

  try {
    await device.claimInterface(iface.interfaceNumber);
  } catch (err: any) {
    // Already claimed — OK
    if (!err.message?.includes('claimed')) throw err;
  }
}

function findBulkOutEndpoint(device: USBDevice): number | null {
  const iface = device.configuration?.interfaces[0];
  if (!iface) return null;

  const alternate = iface.alternate;
  for (const ep of alternate.endpoints) {
    if (ep.direction === 'out' && ep.type === 'bulk') {
      return ep.endpointNumber;
    }
  }

  // Fallback: try endpoint 1 (common for thermal printers)
  return 1;
}
