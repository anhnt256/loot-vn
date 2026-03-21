export const SHIFT_ENUM = {
  SANG: "SANG",
  CHIEU: "CHIEU", 
  TOI: "TOI"
} as const;

export const REPORT_TYPE_ENUM = {
  BAO_CAO_BEP: "BAO_CAO_BEP",
  BAO_CAO_NUOC: "BAO_CAO_NUOC"
} as const;

export const SHIFT_LABELS = {
  [SHIFT_ENUM.SANG]: "Sáng",
  [SHIFT_ENUM.CHIEU]: "Chiều", 
  [SHIFT_ENUM.TOI]: "Tối"
} as const;

export const REPORT_TYPE_LABELS = {
  [REPORT_TYPE_ENUM.BAO_CAO_BEP]: "Báo cáo bếp",
  [REPORT_TYPE_ENUM.BAO_CAO_NUOC]: "Báo cáo nước"
} as const;

export type ShiftType = typeof SHIFT_ENUM[keyof typeof SHIFT_ENUM];
export type ReportType = typeof REPORT_TYPE_ENUM[keyof typeof REPORT_TYPE_ENUM];
