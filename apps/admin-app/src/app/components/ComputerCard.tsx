import React from 'react';
import { Crown } from "lucide-react";
import { isEmpty } from "lodash";
import {
  FaDesktop,
  FaKeyboard,
  FaMouse,
  FaHeadphones,
  FaChair,
  FaWifi,
} from "react-icons/fa";

const EnumComputerStatus = {
  READY: 1,
  OFF: 2,
  ON: 3,
  CRASH: 4,
};

interface DeviceStatus {
  monitorStatus: 'GOOD' | 'DAMAGED_BUT_USABLE' | 'COMPLETELY_DAMAGED';
  keyboardStatus: 'GOOD' | 'DAMAGED_BUT_USABLE' | 'COMPLETELY_DAMAGED';
  mouseStatus: 'GOOD' | 'DAMAGED_BUT_USABLE' | 'COMPLETELY_DAMAGED';
  headphoneStatus: 'GOOD' | 'DAMAGED_BUT_USABLE' | 'COMPLETELY_DAMAGED';
  chairStatus: 'GOOD' | 'DAMAGED_BUT_USABLE' | 'COMPLETELY_DAMAGED';
  networkStatus: 'GOOD' | 'DAMAGED_BUT_USABLE' | 'COMPLETELY_DAMAGED';
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
  machineGroupName?: string;
  battlePass?: {
    isUsed: boolean;
    isPremium: boolean;
    data: { level: number; exp: number } | null;
  };
  machineDetails?: {
    machineGroupName?: string;
    pricePerHour?: number;
    netInfo?: any;
  };
}

interface ComputerCardProps {
  computer: Computer;
  onClick: () => void;
  className?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'GOOD': return 'text-green-500';
    case 'DAMAGED_BUT_USABLE': return 'text-yellow-400';
    case 'COMPLETELY_DAMAGED': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

/** Map machine group keyword → tag color */
const GROUP_STYLES: Record<string, { bg: string; text: string }> = {
  svip:     { bg: 'bg-yellow-300',  text: 'text-black' },
  vip:      { bg: 'bg-orange-500',  text: 'text-white' },
  couple:   { bg: 'bg-rose-400',    text: 'text-white' },
  stream:   { bg: 'bg-fuchsia-600', text: 'text-white' },
  bootcamp: { bg: 'bg-yellow-400',  text: 'text-black' },
  fps:      { bg: 'bg-green-500',   text: 'text-white' },
  moba:     { bg: 'bg-blue-400',    text: 'text-white' },
  phòng:    { bg: 'bg-slate-100',   text: 'text-slate-900' },
};

const DEFAULT_STYLE = { bg: 'bg-gray-400', text: 'text-gray-800' };
const DEFAULT_GROUPS = ['mặc định', 'mac dinh', 'default', 'thường', 'thuong', 'normal'];

/** Auto-generate a consistent color from group name for unknown groups */
function hashColor(str: string): { bg: string; text: string } {
  const COLORS = [
    { bg: 'bg-orange-600', text: 'text-white' },
    { bg: 'bg-lime-600',   text: 'text-white' },
    { bg: 'bg-sky-600',    text: 'text-white' },
    { bg: 'bg-fuchsia-600', text: 'text-white' },
    { bg: 'bg-emerald-600', text: 'text-white' },
    { bg: 'bg-indigo-600', text: 'text-white' },
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getGroupStyle(groupName?: string | null) {
  if (!groupName) return null;
  const key = groupName.toLowerCase().trim();
  if (DEFAULT_GROUPS.some(g => key.includes(g))) return { style: DEFAULT_STYLE, label: groupName };
  for (const [keyword, style] of Object.entries(GROUP_STYLES)) {
    if (key.includes(keyword)) return { style, label: groupName };
  }
  return { style: hashColor(key), label: groupName };
}

const ComputerCard: React.FC<ComputerCardProps> = ({ computer, onClick, className }) => {
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
    machineGroupName,
    battlePass,
  } = computer;

  const {
    monitorStatus,
    keyboardStatus,
    mouseStatus,
    headphoneStatus,
    chairStatus,
    networkStatus,
  } = devices && devices.length > 0 ? devices[0] : {} as Partial<DeviceStatus>;

  const group = getGroupStyle(machineGroupName);

  const isComputerOff = Number(status) === EnumComputerStatus.OFF || Number(status) === EnumComputerStatus.CRASH;
  const isAdminSession = Number(status) === EnumComputerStatus.ON && (!userId || Number(userId) === 0);

  let bgColor = "bg-gray-600";
  if (isComputerOff) {
    // CRASH & OFF → always gray
  } else if (isAdminSession) {
    bgColor = "bg-teal-700";
  } else if (userType === 5) {
    bgColor = "bg-purple-700";
  } else if (Number(status) === EnumComputerStatus.ON) {
    bgColor = "bg-blue-600";
  } else if (Number(status) === EnumComputerStatus.READY) {
    bgColor = "bg-orange-600";
  }

  return (
    <div
      className={`${bgColor} text-white font-bold relative cursor-pointer hover:opacity-90 transition-opacity duration-200 rounded-lg shadow-md leading-[1.15] ${className ? className : 'h-[120px] w-[calc(50%-0.25rem)] sm:w-[140px]'}`}
      onClick={onClick}
    >
      {/* Bottom-left: group tag */}
      {group && (
        <div className="absolute bottom-1 left-1">
          <div className={`${group.style.bg} ${group.style.text} text-[8px] font-bold px-1.5 py-[2px] rounded shadow-sm leading-none`}>
            {group.label}
          </div>
        </div>
      )}
      {/* Bottom-right: combo / admin tag */}
      {!isComputerOff && userType === 5 && (
        <div className="absolute bottom-1 right-1">
          <div className="bg-white text-purple-700 text-[8px] font-bold px-1.5 py-[2px] rounded shadow-sm leading-none">
            COMBO
          </div>
        </div>
      )}
      {isAdminSession && (
        <div className="absolute bottom-1 right-1">
          <div className="bg-red-600 text-yellow-300 text-[8px] font-bold px-1.5 py-[2px] rounded shadow-sm leading-none">
            ADMIN
          </div>
        </div>
      )}

      <div className="absolute top-2 left-2 max-w-[calc(100%-22px)]">
        <div className="text-[13px]">{name}</div>
        {!isComputerOff && !isEmpty(userName) && isUseApp === true && (
          <div className="text-[9px] truncate mt-[1px]">{userName.toUpperCase()}</div>
        )}

        {isEmpty(userName) &&
          isUseApp === true &&
          !isAdminSession &&
          Number(status) === EnumComputerStatus.ON && (
            <>
              <div className="text-[11px] truncate text-red-300 overflow-hidden display-webkit-box webkit-line-clamp-2 webkit-box-orient-vertical mt-1">
                Chưa sử dụng
              </div>
              <div className="text-[9px] truncate text-orange-300 font-bold mt-1">
                {userId}
              </div>
            </>
          )}

        {!isComputerOff && isUseApp === false && (
          <div className="text-[11px] truncate text-red-500 font-bold overflow-hidden display-webkit-box webkit-line-clamp-2 webkit-box-orient-vertical mt-1">
            Không sử dụng
          </div>
        )}

        {!isComputerOff && isUseApp === true && !isEmpty(userName) && (
          <>
            <div className="text-[9px] truncate text-orange-300 font-bold mt-[1px]">
              {userId}
            </div>

            <div className="text-[9px] truncate text-purple-300 font-bold mt-[1px]">
              {`Điểm danh: ${availableCheckIn?.toLocaleString() || 0}`}
            </div>

            <div className="text-[9px] truncate text-blue-300 font-bold mt-[1px]">
              {`Lượt quay: ${round?.toLocaleString() || 0}`}
            </div>
          </>
        )}

        {!isComputerOff && !isEmpty(userName) && userId !== 0 && isUseApp === true && (
          <div
            className={`text-[9px] truncate font-bold mt-[1px] ${Number(stars) > 100000 ? "text-red-400" : "text-yellow-300"}`}
          >
            {`⭐ ${Number(stars) ? Number(stars).toLocaleString() : "0"}`}
          </div>
        )}

        {!isComputerOff && isUseApp === true && !isEmpty(userName) && (
          <div className="text-[8px] text-cyan-300 font-bold mt-[2px]">
            <div className="flex items-center gap-1 mb-[2px]">
              <Crown className="w-[10px] h-[10px] text-yellow-400 flex-shrink-0" />
              <span>Battle Pass:</span>
              {battlePass?.isUsed ? (
                <span
                  className={`text-[7px] font-bold px-[4px] py-[1.5px] rounded leading-none ${
                    battlePass.isPremium
                      ? "bg-orange-500 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {battlePass.isPremium ? "Premium" : "Free"}
                </span>
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex items-center justify-center">
                  <svg
                    className="w-[7px] h-[7px] text-white"
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
              <div className="text-[7.5px] flex items-center gap-1.5 mt-[1px]">
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

      {/* Device Status Icons */}
      <div className="absolute top-2 right-1.5 flex flex-col gap-[3px] items-center">
        <FaDesktop
          className={getStatusColor(monitorStatus || "GOOD")}
          size={9}
        />
        <FaKeyboard
          className={getStatusColor(keyboardStatus || "GOOD")}
          size={9}
        />
        <FaMouse className={getStatusColor(mouseStatus || "GOOD")} size={9} />
        <FaHeadphones
          className={getStatusColor(headphoneStatus || "GOOD")}
          size={9}
        />
        <FaChair className={getStatusColor(chairStatus || "GOOD")} size={9} />
        <FaWifi className={getStatusColor(networkStatus || "GOOD")} size={9} />
      </div>
    </div>
  );
};

export default ComputerCard;
