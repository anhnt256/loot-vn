interface ElectronWindow extends Window {
  electron: {
    getMacAddresses: () => Promise<Array<{ address: string }>>;
  };
}

declare global {
  interface Window {
    electron: ElectronWindow["electron"];
  }
}

export const getMacAddresses = async (): Promise<string[]> => {
  if (typeof window !== "undefined" && window.electron) {
    const result = await window.electron.getMacAddresses();
    // Convert from [{ address: string }, ...] to string[]
    return result.map((item) => item.address);
  }
  return [];
};
