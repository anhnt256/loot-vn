export const SHIFT_ENUM = {
  SANG: "SANG",
  CHIEU: "CHIEU", 
  TOI: "TOI"
} as const;

export const REPORT_TYPE_ENUM = {
  BAO_CAO_BEP: "BAO_CAO_BEP",
  BAO_CAO_NUOC: "BAO_CAO_NUOC"
} as const;

export const BRANCH_ENUM = {
  TAN_PHU: "TAN_PHU",
  GO_VAP: "GO_VAP"
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

export const BRANCH_LABELS = {
  [BRANCH_ENUM.TAN_PHU]: "Tân Phú",
  [BRANCH_ENUM.GO_VAP]: "Gò Vấp"
} as const;

export type ShiftType = typeof SHIFT_ENUM[keyof typeof SHIFT_ENUM];
export type ReportType = typeof REPORT_TYPE_ENUM[keyof typeof REPORT_TYPE_ENUM];
export type BranchType = typeof BRANCH_ENUM[keyof typeof BRANCH_ENUM]; 