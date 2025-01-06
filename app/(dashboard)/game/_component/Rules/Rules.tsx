import { Modal } from "antd";
import React from "react";

interface RulesProps {
  isModalOpen: boolean;
  closeModal: () => void;
}

export function Rules({ isModalOpen, closeModal }: RulesProps) {
  return (
    <Modal
      title="View History"
      open={isModalOpen}
      onCancel={closeModal}
      footer={null}
      width={800}
    >
      <h1>Thể lệ</h1>
    </Modal>
  );
}
