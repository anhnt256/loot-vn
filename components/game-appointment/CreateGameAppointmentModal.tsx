"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { CreateGameAppointmentForm } from "./CreateGameAppointmentForm";

interface CreateGameAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateGameAppointmentModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateGameAppointmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    setIsSubmitting(false);
    onSuccess?.();
    onClose();
  };

  const handleError = () => {
    setIsSubmitting(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Hẹn Chơi Mới"
      size="xl"
    >
      <div className="p-6">
        <CreateGameAppointmentForm 
          onSuccess={handleSuccess}
          onError={handleError}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
        />
      </div>
    </Modal>
  );
}
