"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Monitor, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Wifi, 
  Clock,
  DollarSign,
  Loader2,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { fetchMachineDetails, fetchMachineGroups, MachineDetail, MachineGroup } from "@/lib/machine-utils";

interface MachineSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMachine: (machine: MachineDetail) => void;
  appointmentDuration: number; // in hours
}

export function MachineSelector({ isOpen, onClose, onSelectMachine, appointmentDuration }: MachineSelectorProps) {
  const [machineGroups, setMachineGroups] = useState<MachineGroup[]>([]);
  const [machines, setMachines] = useState<MachineDetail[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<MachineDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load machine groups and machines
  useEffect(() => {
    if (isOpen) {
      loadMachineData();
    }
  }, [isOpen]);

  const loadMachineData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [groupsData, machinesData] = await Promise.all([
        fetchMachineGroups(),
        fetchMachineDetails()
      ]);
      
      setMachineGroups(groupsData);
      setMachines(machinesData);
      
      // Auto-select first group if available
      if (groupsData.length > 0) {
        setSelectedGroup(groupsData[0].MachineGroupId);
      }
    } catch (error) {
      setError("Không thể tải thông tin máy");
      console.error("Error loading machine data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGroupColor = (groupId: number): string => {
    const colors = {
      1: "bg-gray-100 text-gray-800 border-gray-300", // Default
      2: "bg-blue-100 text-blue-800 border-blue-300", // SVIP
      3: "bg-purple-100 text-purple-800 border-purple-300", // VIP
    };
    return colors[groupId as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getGroupIcon = (groupId: number) => {
    const icons = {
      1: "🖥️", // Default
      2: "💎", // SVIP
      3: "👑", // VIP
    };
    return icons[groupId as keyof typeof icons] || "🖥️";
  };

  const getMachineStatus = (netInfo: any): 'online' | 'offline' | 'busy' | 'idle' => {
    if (!netInfo?.ts) return 'offline';
    
    const lastUpdate = parseInt(netInfo.ts) * 1000;
    const now = Date.now();
    const timeDiff = now - lastUpdate;
    
    if (timeDiff > 5 * 60 * 1000) return 'offline';
    
    const cpuLoad = parseFloat(netInfo.cpu_load || '0');
    const gpuLoad = parseFloat(netInfo.gpu_load || '0');
    
    if (cpuLoad > 80 || gpuLoad > 80) return 'busy';
    if (cpuLoad < 10 && gpuLoad < 10) return 'idle';
    
    return 'online';
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      online: "bg-green-100 text-green-800",
      offline: "bg-gray-100 text-gray-800",
      busy: "bg-red-100 text-red-800",
      idle: "bg-yellow-100 text-yellow-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string): string => {
    const texts = {
      online: "Trực tuyến",
      offline: "Offline",
      busy: "Bận",
      idle: "Rảnh"
    };
    return texts[status as keyof typeof texts] || "Không xác định";
  };

  const filteredMachines = selectedGroup 
    ? machines.filter(machine => machine.machineGroupId === selectedGroup)
    : machines;

  const calculateTotalCost = (machine: MachineDetail): number => {
    return machine.price * appointmentDuration;
  };

  const handleSelectMachine = () => {
    if (selectedMachine) {
      onSelectMachine(selectedMachine);
      onClose();
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 text-white">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700 text-white flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-white">
            Chọn máy chơi game
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Chọn máy phù hợp với nhu cầu của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Machine Groups Filter */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-3">Loại máy</h4>
            <div className="flex flex-wrap gap-2">
              {machineGroups.map((group) => (
                <Button
                  key={group.MachineGroupId}
                  variant={selectedGroup === group.MachineGroupId ? "default" : "outline"}
                  onClick={() => setSelectedGroup(group.MachineGroupId)}
                  className={`${getGroupColor(group.MachineGroupId)} ${
                    selectedGroup === group.MachineGroupId 
                      ? "bg-blue-600 text-white" 
                      : "hover:bg-gray-700"
                  }`}
                >
                  <span className="mr-2">{getGroupIcon(group.MachineGroupId)}</span>
                  {group.MachineGroupName}
                  <Badge variant="secondary" className="ml-2">
                    {group.machineCount}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700 rounded text-red-300">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Machines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMachines.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-gray-400">
                <Monitor className="h-12 w-12 mb-4" />
                <p className="text-lg font-semibold">Không có máy nào</p>
                <p className="text-sm">Vui lòng chọn loại máy khác</p>
              </div>
            ) : (
              filteredMachines.map((machine) => {
              const status = getMachineStatus(machine.netInfo);
              const totalCost = calculateTotalCost(machine);
              const isSelected = selectedMachine?.machineName === machine.machineName;
              
              return (
                <div
                  key={machine.machineName}
                  className={`bg-gray-800/50 rounded-lg p-4 border transition-all duration-200 cursor-pointer ${
                    isSelected 
                      ? "border-blue-500 bg-blue-900/20" 
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => setSelectedMachine(machine)}
                >
                  {/* Machine Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-blue-400" />
                      <span className="font-semibold text-white">{machine.machineName}</span>
                    </div>
                    <Badge className={getStatusColor(status)}>
                      {getStatusText(status)}
                    </Badge>
                  </div>

                  {/* Machine Specs */}
                  {machine.netInfo && (
                    <div className="space-y-2 mb-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Cpu className="h-4 w-4 text-green-400" />
                        <span>{machine.netInfo.Cpu || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <HardDrive className="h-4 w-4 text-purple-400" />
                        <span>{machine.netInfo.Gpu || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <MemoryStick className="h-4 w-4 text-yellow-400" />
                        <span>{machine.netInfo.Memory || 'Unknown'}</span>
                      </div>
                    </div>
                  )}

                  {/* Performance Metrics */}
                  {machine.netInfo && (
                    <div className="space-y-1 mb-3 text-xs">
                      <div className="flex justify-between text-gray-400">
                        <span>CPU Load:</span>
                        <span className={parseFloat(machine.netInfo.cpu_load || '0') > 80 ? 'text-red-400' : 'text-green-400'}>
                          {machine.netInfo.cpu_load || '0'}%
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>GPU Load:</span>
                        <span className={parseFloat(machine.netInfo.gpu_load || '0') > 80 ? 'text-red-400' : 'text-green-400'}>
                          {machine.netInfo.gpu_load || '0'}%
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>RAM Load:</span>
                        <span className={parseFloat(machine.netInfo.ram_load || '0') > 80 ? 'text-red-400' : 'text-green-400'}>
                          {machine.netInfo.ram_load || '0'}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Price Info */}
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <DollarSign className="h-4 w-4" />
                        <span>{machine.price.toLocaleString()} VNĐ/giờ</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{appointmentDuration}h</span>
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <div className="text-lg font-semibold text-white">
                        {totalCost.toLocaleString()} VNĐ
                      </div>
                      <div className="text-xs text-gray-400">Tổng cộng</div>
                    </div>
                  </div>
                </div>
              );
            })
            )}
          </div>

          {/* Selected Machine Summary */}
          {selectedMachine && (
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-blue-400" />
                <span className="font-semibold text-blue-300">Máy đã chọn</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Máy:</span>
                  <span className="ml-2 text-white font-medium">{selectedMachine.machineName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Nhóm:</span>
                  <span className="ml-2 text-white font-medium">{selectedMachine.machineGroupName}</span>
                </div>
                <div>
                  <span className="text-gray-400">Giá/giờ:</span>
                  <span className="ml-2 text-white font-medium">{selectedMachine.price.toLocaleString()} VNĐ</span>
                </div>
                <div>
                  <span className="text-gray-400">Thời gian:</span>
                  <span className="ml-2 text-white font-medium">{appointmentDuration} giờ</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-600">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-blue-300">Tổng chi phí:</span>
                  <span className="text-xl font-bold text-white">
                    {calculateTotalCost(selectedMachine).toLocaleString()} VNĐ
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSelectMachine}
            disabled={!selectedMachine}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Chọn máy này
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
