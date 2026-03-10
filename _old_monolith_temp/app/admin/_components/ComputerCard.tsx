import React from "react";
import { Crown, Trophy } from "lucide-react";
import { EnumComputerStatus } from "@/constants/enum";
import { isEmpty } from "lodash";
import {
  FaDesktop,
  FaKeyboard,
  FaMouse,
  FaHeadphones,
  FaChair,
  FaWifi,
} from "react-icons/fa";

interface DeviceStatus {
  monitorStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  keyboardStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  mouseStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  headphoneStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  chairStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  networkStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
}

interface Computer {
  id: number;
  name: string;
  status: number;
  userId: number;
  userName: string;
  round: number;
  totalCheckIn: number;
  claimedCheckIn: number;
  availableCheckIn: number;
  stars: number;
  magicStone: number;
  devices: DeviceStatus[];
  userType?: number;
  isUseApp?: boolean;
  note?: string;
  battlePass?: {
    isUsed: boolean;
    isPremium: boolean;
    data: {
      level: number;
      exp: number;
    } | null;
  };
}

interface ComputerCardProps {
  computer: Computer;
  onClick: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "GOOD":
      return "text-green-500";
    case "DAMAGED_BUT_USABLE":
      return "text-yellow-400";
    case "COMPLETELY_DAMAGED":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};

const ComputerCard: React.FC<ComputerCardProps> = ({ computer, onClick }) => {
  const {
    name,
    status,
    userName,
    userId,
    round,
    availableCheckIn,
    stars,
    devices,
    userType,
    isUseApp,
    battlePass,
  } = computer;

  const {
    monitorStatus,
    keyboardStatus,
    mouseStatus,
    headphoneStatus,
    chairStatus,
    networkStatus,
  } = devices[0] || {};

  let bgColor = "bg-gray-600";
  if (userType === 5) {
    bgColor = "bg-purple-700";
  } else if (Number(status) === EnumComputerStatus.ON.id) {
    bgColor = "bg-blue-600";
  } else if (Number(status) === EnumComputerStatus.READY.id) {
    bgColor = "bg-orange-600";
  }

  return (
    <div
      className={`${bgColor} text-white font-bold h-32 w-32 m-2 relative cursor-pointer hover:opacity-90 transition-opacity duration-200 rounded-lg shadow-md`}
      onClick={onClick}
    >
      {userType === 5 && (
        <div className="absolute top-2 right-2 bg-white text-purple-700 text-xs font-bold px-2 py-1 rounded shadow">
          COMBO
        </div>
      )}

      <div className="absolute top-2 left-2">
        <div>{name}</div>
        {!isEmpty(userName) && isUseApp === true && (
          <div className="text-[9px] truncate">{userName.toUpperCase()}</div>
        )}

        {/* Show "Chưa sử dụng" when userName is null but machine is active (ON status) */}
        {isEmpty(userName) &&
          isUseApp === true &&
          Number(status) === EnumComputerStatus.ON.id && (
            <>
              <div className="text-[11px] truncate text-red-300 overflow-hidden display-webkit-box webkit-line-clamp-2 webkit-box-orient-vertical">
                Chưa sử dụng
              </div>
              <div className="text-[9px] truncate text-orange-300 font-bold">
                {userId}
              </div>
            </>
          )}

        {/* Show "Không sử dụng" in red when isUseApp is false */}
        {isUseApp === false && (
          <div className="text-[11px] truncate text-red-500 font-bold overflow-hidden display-webkit-box webkit-line-clamp-2 webkit-box-orient-vertical">
            Không sử dụng
          </div>
        )}

        {/* Hide UserId, Điểm danh, Lượt quay when machine is not in use */}
        {isUseApp === true && !isEmpty(userName) && (
          <>
            <div className="text-[9px] truncate text-orange-300 font-bold">
              {userId}
            </div>

            <div className="text-[9px] truncate text-purple-300 font-bold">
              {`Điểm danh: ${availableCheckIn.toLocaleString()}`}
            </div>

            <div className="text-[9px] truncate text-blue-300 font-bold">
              {`Lượt quay: ${round.toLocaleString()}`}
            </div>
          </>
        )}

        {!isEmpty(userName) && userId !== 0 && isUseApp === true && (
          <div
            className={`text-[9px] truncate font-bold ${stars > 100000 ? "text-red-400" : "text-yellow-300"}`}
          >
            {`⭐ ${Number(stars) ? Number(stars).toLocaleString() : "0"}`}
          </div>
        )}

        {/* Battle Pass Info - Only show when machine is in use */}
        {isUseApp === true && !isEmpty(userName) && (
          <div className="text-[8px] text-cyan-300 font-bold">
            <div className="flex items-center gap-1 mb-1">
              <Crown className="w-2 h-2 text-yellow-400 flex-shrink-0" />
              <span>Battle Pass:</span>
              {battlePass?.isUsed ? (
                <span
                  className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${
                    battlePass.isPremium
                      ? "bg-orange-500 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {battlePass.isPremium ? "Premium" : "Free"}
                </span>
              ) : (
                <div className="w-2 h-2 rounded-full bg-red-500 flex items-center justify-center">
                  <svg
                    className="w-1.5 h-1.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            {battlePass?.isUsed && battlePass.data && (
              <div className="text-[7px] flex items-center gap-2">
                <span className="text-blue-300 font-bold">
                  Lv.{battlePass.data.level}
                </span>
                <span className="text-green-300 font-bold">
                  EXP:{battlePass.data.exp}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Device Status Icons - Show for all machines */}
      <div className="absolute bottom-2 right-2 flex flex-col gap-1">
        <FaDesktop
          className={getStatusColor(monitorStatus || "GOOD")}
          size={10}
        />
        <FaKeyboard
          className={getStatusColor(keyboardStatus || "GOOD")}
          size={10}
        />
        <FaMouse className={getStatusColor(mouseStatus || "GOOD")} size={10} />
        <FaHeadphones
          className={getStatusColor(headphoneStatus || "GOOD")}
          size={10}
        />
        <FaChair className={getStatusColor(chairStatus || "GOOD")} size={10} />
        <FaWifi className={getStatusColor(networkStatus || "GOOD")} size={10} />
      </div>
    </div>
  );
};

export default ComputerCard;
