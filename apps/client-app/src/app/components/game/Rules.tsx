import { Modal } from 'antd';
import React from 'react';

interface RulesProps {
  isModalOpen: boolean;
  closeModal: () => void;
}

const prizes = [
  { planet: 'Mercury', name: 'Emerald Explorer', amount: 2000 },
  { planet: 'Venus', name: 'Aqua Adventurer', amount: 4000 },
  { planet: 'Earth', name: 'Teal Traveler', amount: 6000 },
  { planet: 'Mars', name: 'Amethyst Ace', amount: 8000 },
  { planet: 'Jupiter', name: 'Violet Voyager', amount: 10000 },
  { planet: 'Saturn', name: 'Golden Guardian', amount: 12000 },
  { planet: 'Neptune', name: 'Sapphire Sovereign', amount: 18000 },
];

function getTenantConfig() {
  const config = (window as any).__TENANT_CONFIG__ ?? {};
  return {
    name: config.name || 'GateWay',
    spendPerRound: Number(config.spendPerRound) || 30000,
    upRateAmount: Number(config.upRateAmount) || 500000,
  };
}

export function Rules({ isModalOpen, closeModal }: RulesProps) {
  const { name: tenantName, spendPerRound, upRateAmount } = getTenantConfig();
  return (
    <Modal title=" " open={isModalOpen} onCancel={closeModal} footer={null} width={800}>
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-primary">
          Thể Lệ Chơi Game Đền Nguyện Ước
        </h1>
        <p className="mb-4 text-gray-300">
          🔹 Tổng tiền nạp trong tuần (<strong>tính từ thứ Hai đến Chủ Nhật</strong>
          ), cứ mỗi <strong>{spendPerRound.toLocaleString()} VNĐ</strong> sẽ nhận được 1 lượt quay.
        </p>
        <h2 className="text-xl font-semibold mb-3 text-secondary">🎁 Giải Thưởng</h2>
        <table className="w-full border border-gray-600 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2 border border-gray-600 text-gray-200">Hành Tinh</th>
              <th className="p-2 border border-gray-600 text-gray-200">Phần Thưởng</th>
              <th className="p-2 border border-gray-600 text-gray-200">Giá Trị (Sao)</th>
            </tr>
          </thead>
          <tbody>
            {prizes.map((prize, index) => (
              <tr key={index} className="odd:bg-gray-800/50 even:bg-gray-800">
                <td className="p-2 border border-gray-600 text-center font-semibold text-gray-200">
                  {prize.planet}
                </td>
                <td className="p-2 border border-gray-600 text-center text-gray-300">
                  {prize.name}
                </td>
                <td className="p-2 border border-gray-600 text-center text-gray-300">
                  {prize.amount.toLocaleString()} ⭐
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-gray-300">
          🔹 Mỗi lượt quay sẽ trích ra một phần vào quỹ chung lên đến{' '}
          {upRateAmount.toLocaleString()} VNĐ (<strong className="text-primary">Jackpot</strong>
          ), và mỗi lượt quay đều có tỉ lệ trúng <strong className="text-primary">Jackpot</strong>.
        </p>
        <p className="mt-4 text-gray-300">
          🔹 <strong>Chỉ những lượt quay từ Đá Ma Thuật (Nạp tiền)</strong> mới được trích thưởng vào
          Jackpot. Các <strong>vòng quay Thưởng (event, khuyến mãi ...)</strong> sẽ không được tính vào Jackpot.
        </p>
        <p className="mt-4 text-gray-300">
          🔹 Giải thưởng sẽ chỉ được sử dụng để đổi lấy giờ chơi hoặc các sản phẩm ở trang Đổi
          thưởng, không có giá trị quy đổi, mua bán bằng tiền mặt.
        </p>
        <p className="mt-4 text-gray-300">
          🔹 <strong>Game chỉ hoạt động nội bộ tại {tenantName}</strong>. Nếu có tranh chấp, quyết định
          của {tenantName} sẽ là quyết định cuối cùng.
        </p>
        <p className="mt-4 text-secondary font-semibold">
          ⚠️ {tenantName} có quyền thay đổi thể lệ mà không cần thông báo trước. Vui lòng cập nhật Thể
          Lệ thường xuyên.
        </p>
        <p className="mt-4 text-red-400 font-semibold">
          ⚠️ Các tài khoản sử dụng cheat, hack, bug để gian lận sẽ bị khoá tài khoản vĩnh viễn.
        </p>
        <p className="mt-4 text-green-400 font-bold text-center">
          🍀 {tenantName} - Đã chơi là phải vui 🍀
        </p>
      </div>
    </Modal>
  );
}
