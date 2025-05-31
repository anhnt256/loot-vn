"use client";

import {
  Button,
  Card,
  Drawer,
  Select,
  Table,
  Modal,
  Form,
  Radio,
  Input,
  message,
} from "antd";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import _, { isEmpty } from "lodash";
import { EnumComputerStatus } from "@/constants/enum";
import { useQuery } from "@tanstack/react-query";
import { usePolling } from "@/hooks/usePolling";
import Cookies from "js-cookie";
import {
  FaDesktop,
  FaKeyboard,
  FaMouse,
  FaHeadphones,
  FaChair,
  FaWifi,
} from "react-icons/fa";

interface DeviceStatus {
  id?: number;
  monitorStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  keyboardStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  mouseStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  headphoneStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  chairStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  networkStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
}

interface RepairHistory {
  id: number;
  date: string;
  issue: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED";
  technician: string;
  type: "REPORT" | "REPAIR";
}

interface Computer {
  name: string;
  status: number;
  userName: string;
  userId: number;
  round: number;
  canClaim: number;
  device?: DeviceStatus;
  repairHistory?: RepairHistory[];
}

interface DeviceStatusOption {
  value: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  label: string;
  color: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "GOOD":
      return "text-green-500";
    case "DAMAGED_BUT_USABLE":
      return "text-orange-500";
    case "COMPLETELY_DAMAGED":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

const AdminDashboard = () => {
  const refreshRef = useRef();
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [currentComputer, setCurrentComputer] = useState<
    Computer | undefined
  >();
  const [computers, setComputers] = useState<Computer[]>([]);
  const [countdown, setCountdown] = useState(60);
  const [selectedBranch, setSelectedBranch] = useState(
    Cookies.get("branch") || "GO_VAP",
  );
  const [loginType, setLoginType] = useState(
    Cookies.get("loginType") || "username",
  );
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm] = Form.useForm();

  const deviceList = [
    {
      key: "monitor",
      label: "Màn hình",
      icon: <FaDesktop className="text-lg" />,
    },
    {
      key: "keyboard",
      label: "Bàn phím",
      icon: <FaKeyboard className="text-lg" />,
    },
    { key: "mouse", label: "Chuột", icon: <FaMouse className="text-lg" /> },
    {
      key: "headphone",
      label: "Tai nghe",
      icon: <FaHeadphones className="text-lg" />,
    },
    { key: "chair", label: "Ghế", icon: <FaChair className="text-lg" /> },
    { key: "network", label: "Mạng", icon: <FaWifi className="text-lg" /> },
  ] as const;

  const deviceStatusOptions: DeviceStatusOption[] = [
    { value: "GOOD", label: "Hoạt động tốt", color: "text-green-500" },
    {
      value: "DAMAGED_BUT_USABLE",
      label: "Hỏng nhưng có thể sử dụng",
      color: "text-yellow-500",
    },
    {
      value: "COMPLETELY_DAMAGED",
      label: "Hỏng hoàn toàn",
      color: "text-red-500",
    },
  ];

  useEffect(() => {
    // Set initial branch cookie if not exists
    if (!Cookies.get("branch")) {
      Cookies.set("branch", "GO_VAP", { path: "/" });
    }
  }, []);

  const { data, refetch } = usePolling<any[]>(`/api/computer`, {
    interval: 60000, // 60 seconds
    onSuccess: (data) => {
      const computerSorted = _.sortBy(data, (o) => o.name);
      setComputers(computerSorted);
      setCountdown(60);
    },
    onError: (error) => {
      console.error("Error fetching data:", error);
    },
  });

  const handleBranchChange = async (value: string) => {
    setSelectedBranch(value);
    Cookies.set("branch", value, { path: "/" });
    setCountdown(60); // Reset countdown
    await refetch(); // Immediately fetch new data for the selected branch
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const repairHistoryColumns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: "REPORT" | "REPAIR") => {
        const typeMap = {
          REPORT: { text: "Báo hỏng", color: "text-red-500" },
          REPAIR: { text: "Sửa chữa", color: "text-blue-500" },
        } as const;
        return (
          <span className={typeMap[type].color}>{typeMap[type].text}</span>
        );
      },
    },
    {
      title: "Vấn đề",
      dataIndex: "issue",
      key: "issue",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: "PENDING" | "IN_PROGRESS" | "RESOLVED") => {
        const statusMap = {
          PENDING: { text: "Đang chờ", color: "text-yellow-500" },
          IN_PROGRESS: { text: "Đang xử lý", color: "text-blue-500" },
          RESOLVED: { text: "Đã xử lý", color: "text-green-500" },
        } as const;
        return (
          <span className={statusMap[status].color}>
            {statusMap[status].text}
          </span>
        );
      },
    },
    {
      title: "Kỹ thuật viên",
      dataIndex: "technician",
      key: "technician",
    },
  ];

  const handleReportIssue = () => {
    setShowReportModal(true);
  };

  const handleReportSubmit = async (values: any) => {
    try {
      const computerId = currentComputer?.id;

      const response = await fetch(`/api/devices/${computerId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "REPORT",
          status: "PENDING",
          technician: values.technician || "admin",
          issue: values.note,
          monitorStatus: values.monitorStatus,
          keyboardStatus: values.keyboardStatus,
          mouseStatus: values.mouseStatus,
          headphoneStatus: values.headphoneStatus,
          chairStatus: values.chairStatus,
          networkStatus: values.networkStatus,
          computerId: computerId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      const updatedDevice = await response.json();
      message.success("Báo cáo đã được gửi thành công");

      // Update the current computer's device status
      if (currentComputer && updatedDevice) {
        setCurrentComputer((prev) => ({
          ...prev!,
          device: updatedDevice,
        }));
      }

      // Refresh the data
      refetch();

      setShowReportModal(false);
      reportForm.resetFields();
    } catch (error) {
      console.error("Error submitting report:", error);
      message.error("Có lỗi xảy ra khi gửi báo cáo");
    }
  };

  const handleUpdateDeviceStatus = () => {
    // TODO: Implement update device status functionality
    console.log("Update device status for computer:", currentComputer?.name);
  };

  return (
    <div className="flex flex-col p-5 gap-4">
      <div className="shadow-lg rounded-lg w-full overflow-auto max-h-[89vh] relative">
        <div className="w-full bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
          <div className="flex justify-between items-center gap-4 mt-4 text-sm mb-4">
            <Select
              value={selectedBranch}
              onChange={handleBranchChange}
              className="w-40 dark [&_.ant-select-disabled_.ant-select-selection-item]:text-white"
              disabled={loginType === "mac"}
              options={[
                { value: "GO_VAP", label: "Gò Vấp" },
                { value: "TAN_PHU", label: "Tân Phú" },
              ]}
              style={{
                backgroundColor: "#1f2937",
                borderColor: "#374151",
              }}
              dropdownStyle={{
                backgroundColor: "#1f2937",
                color: "white",
              }}
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-300">{`Dữ liệu sẽ cập nhật sau: ${countdown}s`}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-300">Đang khởi động</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-300">Đang sử dụng</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-gray-300">Máy tắt</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-start items-center">
            {computers.map((item, index) => {
              const {
                name,
                status,
                userName,
                userId,
                round,
                canClaim,
                device,
              } = item || {};
              let bgColor = "bg-gray-600"; // Darker shade for off state
              if (status === EnumComputerStatus.ON.id) {
                bgColor = "bg-blue-600"; // Darker green
              } else if (status === EnumComputerStatus.READY.id) {
                bgColor = "bg-orange-600"; // Darker orange
              }
              return (
                <div
                  key={index}
                  className={`${bgColor} text-white font-bold h-32 w-32 m-2 relative cursor-pointer hover:opacity-90 transition-opacity duration-200 rounded-lg shadow-md`}
                  onClick={() => {
                    setCurrentComputer(item);
                    setShowDetailDrawer(true);
                  }}
                >
                  <div className="absolute top-2 left-2">
                    <div>{name}</div>
                    {!isEmpty(userName) && (
                      <div className="text-[9px] truncate">
                        {userName.toUpperCase()}
                      </div>
                    )}
                    {isEmpty(userName) &&
                      status === EnumComputerStatus.ON.id && (
                        <div className="text-[11px] truncate text-red-300 overflow-hidden display-webkit-box webkit-line-clamp-2 webkit-box-orient-vertical">
                          Chưa sử dụng
                        </div>
                      )}

                    <div className="text-[9px] truncate text-orange-300 font-bold">
                      {userId}
                    </div>

                    {!isEmpty(userName) && userId !== 0 && (
                      <div className="text-[9px] truncate text-purple-300 font-bold">
                        {`Điểm danh: ${canClaim.toLocaleString()}`}
                      </div>
                    )}

                    <div className="text-[9px] truncate text-blue-300 font-bold">
                      {`Lượt quay: ${round.toLocaleString()}`}
                    </div>
                  </div>

                  {/* Device Status Icons */}
                  <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                    <FaDesktop
                      className={getStatusColor(
                        device?.monitorStatus || "GOOD",
                      )}
                      size={10}
                    />
                    <FaKeyboard
                      className={getStatusColor(
                        device?.keyboardStatus || "GOOD",
                      )}
                      size={10}
                    />
                    <FaMouse
                      className={getStatusColor(device?.mouseStatus || "GOOD")}
                      size={10}
                    />
                    <FaHeadphones
                      className={getStatusColor(
                        device?.headphoneStatus || "GOOD",
                      )}
                      size={10}
                    />
                    <FaChair
                      className={getStatusColor(device?.chairStatus || "GOOD")}
                      size={10}
                    />
                    <FaWifi
                      className={getStatusColor(
                        device?.networkStatus || "GOOD",
                      )}
                      size={10}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Drawer
        title={`Chi tiết máy ${currentComputer?.name}`}
        placement="right"
        onClose={() => {
          setShowDetailDrawer(false);
          setCurrentComputer(undefined);
        }}
        open={showDetailDrawer}
        width={600}
        className="dark-drawer"
        styles={{
          header: {
            background: "#1f2937",
            color: "white",
            borderBottom: "1px solid #374151",
          },
          body: {
            background: "#1f2937",
            padding: "16px",
          },
          mask: {
            background: "rgba(0, 0, 0, 0.6)",
          },
          wrapper: {
            background: "#1f2937",
          },
          footer: {
            background: "#1f2937",
            borderTop: "1px solid #374151",
          },
        }}
      >
        {currentComputer && (
          <div className="flex flex-col gap-4 text-gray-200">
            {/* Computer Information Section */}
            <div className="flex flex-col gap-4 pb-4 border-b border-gray-700">
              <div className="flex flex-col gap-2">
                <div className="text-lg font-bold text-white">
                  Thông tin cơ bản
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-400">Trạng thái:</div>
                  <div>
                    {currentComputer.status === EnumComputerStatus.ON.id
                      ? "Đang sử dụng"
                      : currentComputer.status === EnumComputerStatus.READY.id
                        ? "Đang khởi động"
                        : "Máy tắt"}
                  </div>
                  <div className="text-gray-400">Người dùng:</div>
                  <div>{currentComputer.userName || "Chưa có người dùng"}</div>
                  <div className="text-gray-400">ID người dùng:</div>
                  <div>{currentComputer.userId || "N/A"}</div>
                  <div className="text-gray-400">Điểm danh:</div>
                  <div>{currentComputer.canClaim?.toLocaleString() || 0}</div>
                  <div className="text-gray-400">Lượt quay:</div>
                  <div>{currentComputer.round?.toLocaleString() || 0}</div>
                </div>
              </div>

              {/* Device Status Section */}
              <div className="flex flex-col gap-2">
                <div className="text-lg font-bold text-white">
                  Trạng thái thiết bị
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <FaDesktop
                      className={getStatusColor(
                        currentComputer.device?.monitorStatus || "GOOD",
                      )}
                    />
                    <span>Màn hình</span>
                  </div>
                  <div>{currentComputer.device?.monitorStatus || "GOOD"}</div>

                  <div className="flex items-center gap-2">
                    <FaKeyboard
                      className={getStatusColor(
                        currentComputer.device?.keyboardStatus || "GOOD",
                      )}
                    />
                    <span>Bàn phím</span>
                  </div>
                  <div>{currentComputer.device?.keyboardStatus || "GOOD"}</div>

                  <div className="flex items-center gap-2">
                    <FaMouse
                      className={getStatusColor(
                        currentComputer.device?.mouseStatus || "GOOD",
                      )}
                    />
                    <span>Chuột</span>
                  </div>
                  <div>{currentComputer.device?.mouseStatus || "GOOD"}</div>

                  <div className="flex items-center gap-2">
                    <FaHeadphones
                      className={getStatusColor(
                        currentComputer.device?.headphoneStatus || "GOOD",
                      )}
                    />
                    <span>Tai nghe</span>
                  </div>
                  <div>{currentComputer.device?.headphoneStatus || "GOOD"}</div>

                  <div className="flex items-center gap-2">
                    <FaChair
                      className={getStatusColor(
                        currentComputer.device?.chairStatus || "GOOD",
                      )}
                    />
                    <span>Ghế</span>
                  </div>
                  <div>{currentComputer.device?.chairStatus || "GOOD"}</div>

                  <div className="flex items-center gap-2">
                    <FaWifi
                      className={getStatusColor(
                        currentComputer.device?.networkStatus || "GOOD",
                      )}
                    />
                    <span>Mạng</span>
                  </div>
                  <div>{currentComputer.device?.networkStatus || "GOOD"}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button type="primary" danger onClick={handleReportIssue}>
                  Báo hỏng
                </Button>
                <Button
                  type="primary"
                  onClick={handleUpdateDeviceStatus}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Cập nhật trạng thái thiết bị
                </Button>
              </div>
            </div>

            {/* Repair History Section */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="text-lg font-bold text-white">
                Lịch sử sửa chữa
              </div>
              <Table
                columns={repairHistoryColumns}
                dataSource={currentComputer.repairHistory || []}
                pagination={{ pageSize: 5 }}
                size="small"
                scroll={{ x: true }}
                className="dark-table"
                style={{
                  background: "#1f2937",
                  color: "white",
                }}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* Report Issue Modal */}
      <Modal
        title={<span className="text-white">Báo cáo sự cố thiết bị</span>}
        open={showReportModal}
        onCancel={() => {
          setShowReportModal(false);
          reportForm.resetFields();
        }}
        footer={null}
        className="dark-modal"
        width={900}
        styles={{
          header: {
            background: "#1f2937",
            color: "white",
            borderBottom: "1px solid #374151",
            paddingBottom: "12px",
          },
          content: {
            background: "#1f2937",
          },
          body: {
            background: "#1f2937",
            padding: "20px",
          },
          mask: {
            background: "rgba(0, 0, 0, 0.6)",
          },
          footer: {
            background: "#1f2937",
            borderTop: "1px solid #374151",
          },
        }}
      >
        <Form
          form={reportForm}
          layout="vertical"
          onFinish={handleReportSubmit}
          className="text-gray-200"
          initialValues={{
            monitorStatus: currentComputer?.device?.monitorStatus || "GOOD",
            keyboardStatus: currentComputer?.device?.keyboardStatus || "GOOD",
            mouseStatus: currentComputer?.device?.mouseStatus || "GOOD",
            headphoneStatus: currentComputer?.device?.headphoneStatus || "GOOD",
            chairStatus: currentComputer?.device?.chairStatus || "GOOD",
            networkStatus: currentComputer?.device?.networkStatus || "GOOD",
            technician: "admin",
          }}
        >
          <div className="space-y-2">
            {deviceList.map((device) => (
              <div
                key={device.key}
                className="border-b border-gray-700 pb-2 last:border-b-0"
              >
                <div className="flex items-center gap-2 mb-2">
                  {device.icon}
                  <span className="text-lg font-medium">{device.label}</span>
                </div>
                <Form.Item
                  name={`${device.key}Status`}
                  className="mb-0"
                  rules={[
                    {
                      required: true,
                      message: `Vui lòng chọn trạng thái ${device.label.toLowerCase()}`,
                    },
                  ]}
                >
                  <Radio.Group className="w-full">
                    <div className="grid grid-cols-3 gap-8">
                      {deviceStatusOptions.map((status) => (
                        <Radio key={status.value} value={status.value}>
                          <div className={`${status.color} text-base`}>
                            {status.label}
                          </div>
                        </Radio>
                      ))}
                    </div>
                  </Radio.Group>
                </Form.Item>
              </div>
            ))}
          </div>

          <Form.Item
            label={<span className="text-gray-200">Ghi chú</span>}
            name="note"
            className="mb-0 mt-6"
          >
            <Input.TextArea
              placeholder="Mô tả chi tiết vấn đề của thiết bị..."
              className="dark-input"
              style={{
                backgroundColor: "#374151",
                borderColor: "#4B5563",
                color: "white",
              }}
              rows={4}
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end gap-4 mt-8 pt-4 border-t border-gray-700">
            <Button
              onClick={() => {
                setShowReportModal(false);
                reportForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-600 hover:bg-blue-700 ml-2"
            >
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;

