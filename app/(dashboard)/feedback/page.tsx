import React from "react";
import FeedbackHistory from "@/components/FeedbackHistory";

const FeedbackPage = () => {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 p-4 bg-white border-b">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Feedback của tôi
          </h1>
          <p className="text-gray-600">
            Xem lại các feedback bạn đã gửi và trạng thái xử lý
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 max-w-4xl">
          <FeedbackHistory />
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
