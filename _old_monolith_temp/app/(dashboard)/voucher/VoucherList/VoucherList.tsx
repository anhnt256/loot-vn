"use client";

import React, { useEffect, useMemo, useState } from "react";
import VoucherCard from "../VoucherCard/VoucherCard";

const VoucherList = ({ vouchers }: { vouchers: any }) => {
  const renderData = useMemo(() => {
    return (
      <>
        {vouchers &&
          vouchers.length > 0 &&
          vouchers.map((voucher: any, index: number) => (
            <div className="w-1/6 p-2" key={index}>
              <VoucherCard data={voucher} />
            </div>
          ))}
      </>
    );
  }, [vouchers]);

  return (
    <div className="flex flex-wrap justify-items-center">{renderData}</div>
  );
};
export default VoucherList;
