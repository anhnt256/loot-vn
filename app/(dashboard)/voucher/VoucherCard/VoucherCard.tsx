import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUserInfo } from "@/hooks/use-user-info";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { createUserRewardMap } from "@/actions/create-user-reward-map";
import { nowUtc } from "@/lib/dayjs";
import { updateUser } from "@/actions/update-user";
import { useCopyToClipboard } from "@/hooks/userCopyToClipboard";

interface CardProps {
  data: any;
}

const VoucherCard: React.FC<CardProps> = ({ data }) => {
  const [value, copy] = useCopyToClipboard();

  const { id, promotionCode } = data;
  const { code, name } = promotionCode || {};

  const onReward = async () => {
    await copy(code);
    toast.message(
      "Bạn đã copy mã thành công. Vui lòng nhập mã vào Senet để đổi thưởng. Xin cảm ơn",
    );
  };

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      <Image
        src="/voucher.png"
        alt={name}
        width={500}
        height={300}
        objectFit="cover"
      />
      <div className="px-5 py-4">
        <div className="font-bold text-xs mb-2 min-h-[32px] cursor-default">
          {name}
        </div>
      </div>
      <hr />
      <div className="px-5 py-4">
        <div className="flex justify-center items-center">
          <Button variant="primary" onClick={onReward}>
            Sử dụng ngay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoucherCard;
