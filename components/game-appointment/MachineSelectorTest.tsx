"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MachineSelector } from "./MachineSelector";
import { MachineDetail } from "@/lib/machine-utils";

export function MachineSelectorTest() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<MachineDetail | null>(null);

  const handleSelectMachine = (machine: MachineDetail) => {
    setSelectedMachine(machine);
    console.log("Selected machine:", machine);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test Machine Selector</h2>
      
      <Button onClick={() => setIsOpen(true)}>
        Open Machine Selector
      </Button>

      {selectedMachine && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Selected Machine:</h3>
          <p>Name: {selectedMachine.machineName}</p>
          <p>Group: {selectedMachine.machineGroupName}</p>
          <p>Price: {selectedMachine.price.toLocaleString()} VNĐ/giờ</p>
          {selectedMachine.netInfo && (
            <div>
              <p>CPU: {selectedMachine.netInfo.Cpu}</p>
              <p>GPU: {selectedMachine.netInfo.Gpu}</p>
              <p>Memory: {selectedMachine.netInfo.Memory}</p>
            </div>
          )}
        </div>
      )}

      <MachineSelector
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelectMachine={handleSelectMachine}
        appointmentDuration={4}
      />
    </div>
  );
}
