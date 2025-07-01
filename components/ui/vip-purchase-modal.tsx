import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import { Button } from "./button";
import { useState } from "react";

interface VIPPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => Promise<void>;
  price: number;
}

export function VIPPurchaseModal({
  isOpen,
  onClose,
  onPurchase,
  price,
}: VIPPurchaseModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      await onPurchase();
      onClose();
    } catch (error) {
      console.error("Failed to purchase VIP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase Battle Pass VIP</DialogTitle>
          <DialogDescription>
            Unlock exclusive rewards and faster progression with Battle Pass
            VIP.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">VIP Benefits:</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>Exclusive VIP rewards</li>
              <li>Faster progression</li>
              <li>Premium content access</li>
              <li>Special VIP badge</li>
            </ul>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Price:</span>
            <span className="text-lg font-bold">${price}</span>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} disabled={isLoading}>
            {isLoading ? "Processing..." : "Purchase VIP"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
