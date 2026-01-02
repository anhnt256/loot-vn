"use client";

import StaffInfoEdit from "./StaffInfoEdit";

interface StaffInfoProps {
  staffData: any;
  onRefresh: () => void;
}

export default function StaffInfo({ staffData, onRefresh }: StaffInfoProps) {
  return <StaffInfoEdit staffData={staffData} onRefresh={onRefresh} />;
}

