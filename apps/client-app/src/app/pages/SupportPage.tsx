import React from 'react';

const SupportPage: React.FC = () => (
  <div className="flex flex-col p-3 h-screen gap-3">
    {/* Section 1: Hướng dẫn xử lý lỗi cơ bản */}
    <div className="bg-gray-900/95 rounded-xl p-5 border border-gray-800 shadow-lg">
      <h2 className="text-white text-lg font-bold mb-3">Hướng dẫn xử lý các lỗi cơ bản</h2>
      <div className="text-gray-300 space-y-2 text-sm leading-relaxed">
        <p><strong>1. Máy bị lag / giật:</strong> Thử tắt các ứng dụng không cần thiết, kiểm tra kết nối mạng, hoặc restart lại máy.</p>
        <p><strong>2. Không kết nối được mạng:</strong> Kiểm tra dây mạng đã cắm chắc chưa, thử rút ra cắm lại. Nếu vẫn không được, báo nhân viên.</p>
        <p><strong>3. Màn hình bị đen:</strong> Kiểm tra nguồn điện và dây kết nối màn hình. Thử nhấn nút nguồn màn hình.</p>
        <p><strong>4. Bàn phím / chuột không hoạt động:</strong> Rút USB ra cắm lại. Nếu vẫn không được, đổi sang cổng USB khác.</p>
        <p><strong>5. Âm thanh không có:</strong> Kiểm tra tai nghe đã cắm đúng cổng chưa, và chỉnh âm lượng trong hệ thống.</p>
      </div>
    </div>

    {/* Section 2: Yêu cầu game */}
    <div className="flex-1 bg-gray-900/95 rounded-xl p-5 border border-gray-800 shadow-lg">
      <h2 className="text-white text-lg font-bold mb-3">Yêu cầu game</h2>
      <p className="text-gray-400 text-sm mb-4">
        Bạn muốn chơi game nào chưa có trên máy? Hãy cung cấp thông tin bên dưới, chúng tôi sẽ hỗ trợ tải game cho bạn.
      </p>
      <div className="text-gray-400 text-sm">
        Tính năng đang phát triển...
      </div>
    </div>
  </div>
);

export default SupportPage;
