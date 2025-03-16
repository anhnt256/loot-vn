import { Modal } from "antd";
import React from "react";

interface RulesProps {
  isModalOpen: boolean;
  closeModal: () => void;
}

export function Rules({ isModalOpen, closeModal }: RulesProps) {
  const prizes = [
    { planet: "Mercury", name: "Emerald Explorer", amount: 2000 },
    { planet: "Venus", name: "Aqua Adventurer", amount: 4000 },
    { planet: "Earth", name: "Teal Traveler", amount: 6000 },
    { planet: "Mars", name: "Amethyst Ace", amount: 8000 },
    { planet: "Jupiter", name: "Violet Voyager", amount: 10000 },
    { planet: "Saturn", name: "Golden Guardian", amount: 12000 },
    { planet: "Neptune", name: "Sapphire Sovereign", amount: 18000 },
  ];

  const WishingTempleRules: React.FC = () => {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-4">
          🎮 Thể Lệ Chơi Game Đền Nguyện Ước
        </h1>
        <p className="mb-4 text-gray-700">
          🔹 Tổng tiền nạp trong tuần (<strong>tính từ thứ Hai đến Chủ Nhật</strong>,
          cứ mỗi <strong>30.000 VNĐ</strong> sẽ nhận được 1 lượt quay.
        </p>
        <h2 className="text-xl font-semibold mb-3">🎁 Giải Thưởng</h2>
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Hành Tinh</th>
              <th className="p-2 border">Phần Thưởng</th>
              <th className="p-2 border">Giá Trị (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            {prizes.map((prize, index) => (
              <tr key={index} className="odd:bg-gray-100">
                <td className="p-2 border text-center font-semibold">
                  {prize.planet}
                </td>
                <td className="p-2 border text-center">{prize.name}</td>
                <td className="p-2 border text-center">
                  {prize.amount.toLocaleString()} VNĐ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-gray-700">
          🔹 Mỗi lượt quay sẽ trích ra một phần vào quỹ chung lên đến 500,000
          VNĐ (<strong>Jackpot</strong>), và mỗi lượt quay đều có tỉ lệ trúng
          <strong> Jackpot</strong>.
        </p>
        <p className="mt-4 text-gray-700">
          🔹 Giải thưởng sẽ chỉ được sử dụng để đổi lấy giờ chơi hoặc các sản
          phẩm ở trang Đổi thưởng, không có giá trị quy đổi, mua bán bằng tiền
          mặt.
        </p>
        <p className="mt-4 text-gray-700">
          🔹 <strong>Game chỉ hoạt động nội bộ tại GateWay</strong>. Nếu có
          tranh chấp, quyết định của GateWay sẽ là quyết định cuối cùng.
        </p>
        <p className="mt-4 text-blue-600 font-semibold">
          ⚠️ GateWay có quyền thay đổi thể lệ mà không cần thông báo trước. Vui
          lòng cập nhật Thể Lệ thường xuyên.
        </p>
        <p className="mt-4 text-red-600 font-semibold">
          ⚠️ Các tài khoản sử dụng cheat, hack, bug để gian lận sẽ bị khoá tài
          khoản vĩnh viễn.
        </p>
        <p className="mt-4 text-green-600 font-bold text-center">
          🍀 The GateWay eSport Gaming - Đã chơi là phải vui🍀
        </p>
      </div>
    );
  };

  return (
    <Modal
      title=" "
      open={isModalOpen}
      onCancel={closeModal}
      footer={null}
      width={800}
    >
      <WishingTempleRules />
    </Modal>
  );
}
