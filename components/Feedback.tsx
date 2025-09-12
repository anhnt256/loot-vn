"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  MessageCircle,
  X,
  Send,
  Star,
  Check,
  AlertCircle,
  Info,
  Eye,
  ArrowLeft,
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  Car,
  Wifi,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useLocalStorageValue } from "@/hooks/useLocalStorageValue";
import { CURRENT_USER } from "@/constants/token.constant";

interface CategoryFeedback {
  id: string;
  name: string;
  rating: number;
  selected: boolean;
  note: string;
}

interface FeedbackData {
  categories: CategoryFeedback[];
}

interface DeviceStatus {
  monitorStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  keyboardStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  mouseStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  headphoneStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  chairStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  networkStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
}

interface DeviceFeedback {
  monitorStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  keyboardStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  mouseStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  headphoneStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  chairStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
  networkStatus: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED";
}

const feedbackCategories = [
  {
    id: "space",
    name: "Không gian",
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    activeColor: "bg-blue-600",
    borderColor: "border-blue-500",
    icon: "🏢",
    placeholder:
      "Mô tả vấn đề về không gian (ví dụ: ánh sáng, nhiệt độ, tiếng ồn...)",
    isActive: true,
    isCompleted: false,
  },
  {
    id: "food",
    name: "Đồ ăn / Thức uống",
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    activeColor: "bg-green-600",
    borderColor: "border-green-500",
    icon: "🍽️",
    placeholder: "Ghi rõ tên món ăn/thức uống và vấn đề gặp phải...",
    isActive: false,
    isCompleted: false,
  },
  {
    id: "machines",
    name: "Máy móc",
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    activeColor: "bg-purple-600",
    borderColor: "border-purple-500",
    icon: "⚙️",
    placeholder: "Mô tả máy móc nào và tình trạng cụ thể...",
    isActive: false,
    isCompleted: false,
  },
  {
    id: "staff",
    name: "Nhân viên",
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    activeColor: "bg-orange-600",
    borderColor: "border-orange-500",
    icon: "👥",
    placeholder: "Ghi rõ tên nhân viên và vấn đề gặp phải...",
    isActive: false,
    isCompleted: false,
  },
  {
    id: "cleanliness",
    name: "Vệ sinh",
    color: "bg-red-500",
    hoverColor: "hover:bg-red-600",
    activeColor: "bg-red-600",
    borderColor: "border-red-500",
    icon: "🧹",
    placeholder: "Mô tả vấn đề vệ sinh cụ thể và vị trí...",
    isActive: false,
    isCompleted: false,
  },
];

const deviceItems = [
  { id: "monitor", name: "Màn hình", icon: Monitor, field: "monitorStatus" },
  { id: "keyboard", name: "Bàn phím", icon: Keyboard, field: "keyboardStatus" },
  { id: "mouse", name: "Chuột", icon: Mouse, field: "mouseStatus" },
  {
    id: "headphone",
    name: "Tai nghe",
    icon: Headphones,
    field: "headphoneStatus",
  },
  { id: "chair", name: "Ghế", icon: Car, field: "chairStatus" },
  { id: "network", name: "Mạng", icon: Wifi, field: "networkStatus" },
];

const deviceStatusOptions = [
  {
    value: "GOOD",
    label: "Hoạt động tốt",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    value: "DAMAGED_BUT_USABLE",
    label: "Hỏng nhưng có thể sử dụng",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    value: "COMPLETELY_DAMAGED",
    label: "Hỏng hoàn toàn",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
];

const Feedback = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentDeviceStatus, setCurrentDeviceStatus] =
    useState<DeviceStatus | null>(null);
  const [deviceFeedback, setDeviceFeedback] = useState<DeviceFeedback>({
    monitorStatus: "GOOD",
    keyboardStatus: "GOOD",
    mouseStatus: "GOOD",
    headphoneStatus: "GOOD",
    chairStatus: "GOOD",
    networkStatus: "GOOD",
  });
  const [isLoadingDevice, setIsLoadingDevice] = useState(false);

  // 1. Thêm state lưu image base64 cho từng category
  const [feedbackImages, setFeedbackImages] = useState<{
    [categoryId: string]: string;
  }>({});
  // State để hiển thị modal xem ảnh to
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    imageIndex: number;
    totalImages: number;
    categoryId: string; // Thêm categoryId để biết đang xem hình của category nào
  }>({
    isOpen: false,
    imageUrl: "",
    imageIndex: 0,
    totalImages: 0,
    categoryId: "",
  });

  // Sử dụng hook để lấy currentUser từ localStorage
  const currentUser: any = useLocalStorageValue(CURRENT_USER, null);

  // State để quản lý isActive và isCompleted cho từng category
  const [categoriesState, setCategoriesState] = useState(() => {
    return feedbackCategories.map((cat) => ({
      id: cat.id,
      isActive: cat.isActive || false,
      isCompleted: cat.isCompleted || false,
    }));
  });

  // Load saved data from localStorage on component mount
  const [feedbackData, setFeedbackData] = useState<FeedbackData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("feedback-progress");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed;
        } catch (e) {
          console.log("Failed to parse saved feedback data, using default");
        }
      }
    }
    // Default state with "Không gian" selected
    return {
      categories: feedbackCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        rating: 0,
        selected: cat.id === "space",
        note: "",
      })),
    };
  });

  // Save to localStorage whenever feedbackData changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("feedback-progress", JSON.stringify(feedbackData));
    }
  }, [feedbackData]);

  // Clear localStorage when user leaves the app
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("feedback-progress");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Auto-set active tab to "space" when modal opens
  useEffect(() => {
    if (isOpen) {
      setCategoriesState((prev) =>
        prev.map((cat) => ({
          ...cat,
          isActive: cat.id === "space",
        })),
      );
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".dropdown-container")) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Check completion status for all categories
  useEffect(() => {
    const updatedCategoriesState = categoriesState.map((cat) => {
      const categoryData = feedbackData.categories.find((c) => c.id === cat.id);
      if (!categoryData || !categoryData.selected) return cat;

      const hasImages =
        feedbackImages[cat.id] && feedbackImages[cat.id].trim() !== "";
      let isCompleted = false;

      if (hasImages) {
        // Nếu có hình ảnh thì phải có cả rating và comment
        isCompleted =
          categoryData.rating > 0 &&
          (categoryData.note ? categoryData.note.trim() !== "" : false);
      } else {
        // Nếu không có hình ảnh thì logic cũ
        isCompleted =
          categoryData.rating > 0 &&
          (categoryData.rating > 2 ||
            (categoryData.rating <= 2 &&
              (categoryData.note ? categoryData.note.trim() !== "" : false)));
      }

      return { ...cat, isCompleted };
    });

    setCategoriesState(updatedCategoriesState);
  }, [feedbackData, feedbackImages]);

  // Load device status when machines tab is active
  useEffect(() => {
    const loadDeviceStatus = () => {
      const activeCategoryId = categoriesState.find((c) => c.isActive)?.id;
      if (
        activeCategoryId === "machines" &&
        !currentDeviceStatus &&
        !isLoadingDevice
      ) {
        setIsLoadingDevice(true);

        // Lấy thông tin device từ currentUser thay vì gọi API
        if (
          currentUser?.device &&
          Array.isArray(currentUser.device) &&
          currentUser.device.length > 0
        ) {
          // Nếu device là array và có data
          const device = currentUser.device[0]; // Lấy device đầu tiên
          setCurrentDeviceStatus({
            monitorStatus: device.monitorStatus,
            keyboardStatus: device.keyboardStatus,
            mouseStatus: device.mouseStatus,
            headphoneStatus: device.headphoneStatus,
            chairStatus: device.chairStatus,
            networkStatus: device.networkStatus,
          });
          setDeviceFeedback({
            monitorStatus: device.monitorStatus,
            keyboardStatus: device.keyboardStatus,
            mouseStatus: device.mouseStatus,
            headphoneStatus: device.headphoneStatus,
            chairStatus: device.chairStatus,
            networkStatus: device.networkStatus,
          });
        } else {
          // Nếu device = [] hoặc null, set tất cả là GOOD
          const defaultGoodStatus = {
            monitorStatus: "GOOD" as const,
            keyboardStatus: "GOOD" as const,
            mouseStatus: "GOOD" as const,
            headphoneStatus: "GOOD" as const,
            chairStatus: "GOOD" as const,
            networkStatus: "GOOD" as const,
          };
          setCurrentDeviceStatus(defaultGoodStatus);
          setDeviceFeedback(defaultGoodStatus);
        }

        setIsLoadingDevice(false);
      }
    };

    loadDeviceStatus();
  }, [categoriesState, currentUser]); // Thêm currentUser vào dependency

  // Check if all devices are GOOD
  const allDevicesGood =
    currentDeviceStatus &&
    Object.values(currentDeviceStatus).every((status) => status === "GOOD");

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle image modal shortcuts
      if (imageModal.isOpen) {
        if (e.key === "Escape") {
          closeImageModal();
          return;
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          navigateImage("prev");
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          navigateImage("next");
          return;
        }
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        if (showSummary) {
          setShowSummary(false);
        } else {
          setIsOpen(false);
        }
      }

      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        if (showSummary) {
          handleSubmitFeedback();
        } else {
          handleSubmit();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showSummary, imageModal.isOpen]);

  const handlePreviewSubmit = () => {
    const selectedCategories = feedbackData.categories.filter(
      (cat) => cat.selected,
    );

    if (selectedCategories.length === 0) {
      toast.error("Vui lòng chọn ít nhất một loại đánh giá");
      return;
    }

    const unratedCategories = selectedCategories.filter(
      (cat) => cat.rating === 0,
    );
    if (unratedCategories.length > 0) {
      toast.error(
        `Vui lòng đánh giá cho: ${unratedCategories.map((cat) => cat.name).join(", ")}`,
      );
      return;
    }

    // Chỉ bắt buộc ghi chú khi rating <= 2 sao
    const categoriesNeedingNote = selectedCategories.filter(
      (cat) => cat.rating <= 2 && !cat.note.trim(),
    );
    if (categoriesNeedingNote.length > 0) {
      toast.error(
        `Vui lòng nhập chi tiết cho: ${categoriesNeedingNote.map((cat) => cat.name).join(", ")}`,
      );
      return;
    }

    // Kiểm tra: Nếu có hình ảnh thì bắt buộc phải có rating và comment
    const categoriesWithImages = selectedCategories.filter(
      (cat) => feedbackImages[cat.id] && feedbackImages[cat.id].trim() !== "",
    );

    const categoriesWithImagesButNoRating = categoriesWithImages.filter(
      (cat) => cat.rating === 0,
    );
    if (categoriesWithImagesButNoRating.length > 0) {
      toast.error(
        `Vui lòng đánh giá cho các loại có hình ảnh: ${categoriesWithImagesButNoRating.map((cat) => cat.name).join(", ")}`,
      );
      return;
    }

    const categoriesWithImagesButNoComment = categoriesWithImages.filter(
      (cat) => !cat.note || cat.note.trim() === "",
    );
    if (categoriesWithImagesButNoComment.length > 0) {
      toast.error(
        `Vui lòng nhập chi tiết cho các loại có hình ảnh: ${categoriesWithImagesButNoComment.map((cat) => cat.name).join(", ")}`,
      );
      return;
    }

    setShowSummary(true);
  };

  const handleSubmit = () => {
    const selectedCategories = feedbackData.categories.filter(
      (cat) => cat.selected,
    );

    if (selectedCategories.length === 0) {
      toast.error("Vui lòng chọn ít nhất một loại đánh giá");
      return;
    }

    // Kiểm tra các category có rating > 0 hoặc có note
    const validCategories = selectedCategories.filter(
      (cat) => cat.rating > 0 || (cat.note && cat.note.trim() !== ""),
    );
    if (validCategories.length === 0) {
      toast.error("Vui lòng đánh giá hoặc ghi chú ít nhất một loại đã chọn");
      return;
    }

    // Nếu có note thì bắt buộc phải có rating
    const categoriesWithNoteButNoRating = validCategories.filter(
      (cat) => cat.note && cat.note.trim() !== "" && cat.rating === 0,
    );
    if (categoriesWithNoteButNoRating.length > 0) {
      toast.error(
        `Vui lòng đánh giá cho: ${categoriesWithNoteButNoRating.map((cat) => cat.name).join(", ")}`,
      );
      return;
    }

    // Kiểm tra: Nếu có hình ảnh thì bắt buộc phải có rating và comment
    const categoriesWithImages = validCategories.filter(
      (cat) => feedbackImages[cat.id] && feedbackImages[cat.id].trim() !== "",
    );

    const categoriesWithImagesButNoRating = categoriesWithImages.filter(
      (cat) => cat.rating === 0,
    );
    if (categoriesWithImagesButNoRating.length > 0) {
      toast.error(
        `Vui lòng đánh giá cho các loại có hình ảnh: ${categoriesWithImagesButNoRating.map((cat) => cat.name).join(", ")}`,
      );
      return;
    }

    const categoriesWithImagesButNoComment = categoriesWithImages.filter(
      (cat) => !cat.note || cat.note.trim() === "",
    );
    if (categoriesWithImagesButNoComment.length > 0) {
      toast.error(
        `Vui lòng nhập chi tiết cho các loại có hình ảnh: ${categoriesWithImagesButNoComment.map((cat) => cat.name).join(", ")}`,
      );
      return;
    }

    setShowSummary(true);
  };

  // Function to reset feedback form completely
  const resetFeedback = () => {
    const defaultState = {
      categories: feedbackCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        rating: 0,
        selected: cat.id === "space",
        note: "",
      })),
    };

    setFeedbackData(defaultState);
    setDeviceFeedback({
      monitorStatus: "GOOD",
      keyboardStatus: "GOOD",
      mouseStatus: "GOOD",
      headphoneStatus: "GOOD",
      chairStatus: "GOOD",
      networkStatus: "GOOD",
    });
    setFeedbackImages({});
    setShowSummary(false);
    setActiveTab("space");

    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("feedback-progress");
      localStorage.removeItem("feedback-images");
      localStorage.removeItem("feedback-device-status");
    }
  };

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      resetFeedback();
    }
  }, [isOpen]);

  const handleSubmitFeedback = async () => {
    setIsSubmitting(true);

    try {
      const selectedCategories = feedbackData.categories.filter(
        (cat) => cat.selected,
      );
      // Chỉ gửi các category có rating > 0 hoặc có note
      const validCategories = selectedCategories.filter(
        (cat) => cat.rating > 0 || (cat.note && cat.note.trim() !== ""),
      );

      // Lấy computerId từ localStorage currentUser
      const currentUserStr = localStorage.getItem("currentUser");
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      const computerId = currentUser?.device?.computerId || null; // Lấy từ device.computerId

      console.log("Current user:", currentUser);
      console.log("Computer ID:", computerId);

      // Gửi từng category feedback riêng biệt
      const promises = validCategories.map(async (category) => {
        const response = await fetch("/api/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "improvement",
            title: `Feedback về ${category.name}`,
            description: `Đánh giá: ${category.rating}/5 sao\n\nChi tiết: ${category.note}`,
            priority:
              category.rating <= 2
                ? "high"
                : category.rating <= 3
                  ? "medium"
                  : "low",
            category: category.id,
            rating: category.rating,
            image: feedbackImages[category.id] || null,
            computerId: computerId, // Thêm computerId
          }),
        });
        return response;
      });

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every((res) => res.ok);

      if (allSuccessful) {
        toast.success(
          "Gửi feedback thành công! Cảm ơn bạn đã đóng góp ý kiến.",
        );

        // Reset form completely
        resetFeedback();
        setIsOpen(false);
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const currentCategory = feedbackData.categories.find(
      (c) => c.id === categoryId,
    );
    const isCurrentlySelected = currentCategory?.selected || false;

    console.log(
      "Toggle category:",
      categoryId,
      "Currently selected:",
      isCurrentlySelected,
    );

    // Nếu chưa được chọn, thêm vào danh sách selected
    if (!isCurrentlySelected) {
      setFeedbackData((prev) => ({
        ...prev,
        categories: prev.categories.map((cat) =>
          cat.id === categoryId
            ? { ...cat, selected: true, rating: 0, note: "" }
            : cat,
        ),
      }));
    }
    // Nếu đã được chọn, không làm gì cả (không cho phép bỏ chọn)
  };

  const setActiveTab = (categoryId: string) => {
    setCategoriesState((prev) =>
      prev.map((cat) => ({
        ...cat,
        isActive: cat.id === categoryId,
      })),
    );
  };

  const updateCategoryRating = (categoryId: string, rating: number) => {
    setFeedbackData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === categoryId ? { ...cat, rating } : cat,
      ),
    }));
  };

  const updateCategoryNote = (categoryId: string, note: string) => {
    setFeedbackData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === categoryId ? { ...cat, note } : cat,
      ),
    }));
  };

  const updateDeviceStatus = (
    deviceField: keyof DeviceFeedback,
    status: "GOOD" | "DAMAGED_BUT_USABLE" | "COMPLETELY_DAMAGED",
  ) => {
    setDeviceFeedback((prev) => ({
      ...prev,
      [deviceField]: status,
    }));
  };

  // Hàm nén hình ảnh
  const compressImage = (
    file: File,
    maxWidth: number = 800,
    quality: number = 0.7,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Tính toán kích thước mới giữ nguyên tỷ lệ
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Set kích thước canvas
        canvas.width = width;
        canvas.height = height;

        // Vẽ hình ảnh đã resize lên canvas
        ctx?.drawImage(img, 0, 0, width, height);

        // Chuyển đổi thành base64 với chất lượng đã nén
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // 2. Hàm xử lý paste vào textarea
  const handlePasteImage = async (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    categoryId: string,
  ) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          // Kiểm tra xem đã có ảnh nào chưa
          const hasAnyImage = Object.values(feedbackImages).some(
            (images) => images && images.trim() !== "",
          );
          if (hasAnyImage) {
            toast.error("Chỉ được gửi 1 ảnh duy nhất cho feedback");
            return;
          }

          try {
            // Nén hình ảnh
            const compressedImage = await compressImage(file);

            // Cập nhật state - chỉ lưu 1 ảnh cho category hiện tại
            setFeedbackImages((prev) => ({
              ...prev,
              [categoryId]: compressedImage,
            }));

            toast.success("Đã thêm ảnh thành công");
          } catch (error) {
            toast.error("Có lỗi khi xử lý hình ảnh");
            console.error("Error compressing image:", error);
          }
        }
        e.preventDefault();
        break;
      }
    }
  };

  // Hàm mở modal xem ảnh to
  const openImageModal = (
    imageUrl: string,
    imageIndex: number,
    totalImages: number,
    categoryId: string,
  ) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      imageIndex,
      totalImages,
      categoryId,
    });
  };

  // Hàm đóng modal xem ảnh
  const closeImageModal = () => {
    setImageModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Hàm chuyển ảnh trong modal
  const navigateImage = (direction: "prev" | "next") => {
    // Sử dụng categoryId từ imageModal thay vì tìm category active
    const categoryId = imageModal.categoryId;
    if (!categoryId) return;

    const currentImages = feedbackImages[categoryId];
    if (!currentImages) return;

    const images = currentImages.split("|");
    let newIndex = imageModal.imageIndex;

    if (direction === "prev") {
      newIndex = newIndex > 0 ? newIndex - 1 : images.length - 1;
    } else {
      newIndex = newIndex < images.length - 1 ? newIndex + 1 : 0;
    }

    setImageModal((prev) => ({
      ...prev,
      imageUrl: images[newIndex],
      imageIndex: newIndex,
    }));
  };

  const renderStars = (
    rating: number,
    onStarClick: (star: number) => void,
    disabled = false,
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !disabled && onStarClick(star)}
            className={`transition-all duration-200 ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"}`}
            disabled={disabled}
          >
            <Star
              className={`h-7 w-7 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                  : "text-gray-300 hover:text-yellow-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Rất không hài lòng";
      case 2:
        return "Không hài lòng";
      case 3:
        return "Bình thường";
      case 4:
        return "Hài lòng";
      case 5:
        return "Rất hài lòng";
      default:
        return "Chọn mức đánh giá";
    }
  };

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1:
        return "text-red-600";
      case 2:
        return "text-orange-600";
      case 3:
        return "text-yellow-600";
      case 4:
        return "text-blue-600";
      case 5:
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const selectedCategories = feedbackData.categories.filter(
    (cat) => cat.selected,
  );
  const completedCategories = selectedCategories.filter(
    (cat) => cat.rating > 0 && cat.note.trim() !== "",
  );
  const progressPercentage =
    selectedCategories.length > 0
      ? (completedCategories.length / selectedCategories.length) * 100
      : 0;

  return (
    <>
      {/* Multi-purpose Button with Dropdown */}
      <div className="fixed bottom-6 left-6 z-50 dropdown-container">
        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute bottom-16 left-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="py-1">
              <button
                onClick={() => {
                  setIsOpen(true);
                  setShowDropdown(false);
                }}
                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors duration-200"
              >
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Gửi phản hồi</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Button */}
        <Button
          onClick={() => setShowDropdown(!showDropdown)}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
          size="icon"
        >
          <Menu className="h-7 w-7 text-white" />
        </Button>
      </div>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                {showSummary ? "Xác nhận Feedback" : "Gửi Feedback"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (showSummary) {
                    setShowSummary(false);
                  } else {
                    setIsOpen(false);
                  }
                }}
                className="h-8 w-8 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="pt-6">
              {!showSummary ? (
                <>
                  {/* Description */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600 mt-0.5">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-blue-800 leading-relaxed mb-2">
                          Mỗi đóng góp của bạn là động lực để chúng tôi phát
                          triển. Cảm ơn bạn đã đồng hành cùng chúng tôi vì một
                          mái nhà chung.
                        </p>
                        <p className="text-xs text-blue-600">
                          📸 Chụp hình: Nhấn Shift + Windows + S để chụp màn
                          hình, sau đó paste vào ô chi tiết (tối đa 1 ảnh)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Category Selection */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <span>Chọn loại đánh giá</span>
                        <span className="text-sm text-gray-500 font-normal">
                          (có thể chọn nhiều)
                        </span>
                      </Label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {feedbackCategories.map((category) => {
                          const catData = feedbackData.categories.find(
                            (c) => c.id === category.id,
                          );
                          const catState = categoriesState.find(
                            (c) => c.id === category.id,
                          );
                          const isSelected = catData?.selected || false;
                          const isActive = catState?.isActive || false;
                          const isCompleted = catState?.isCompleted || false;

                          return (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => {
                                toggleCategory(category.id);
                                setActiveTab(category.id);
                              }}
                              className={`p-3 rounded-lg text-white text-sm font-medium transition-all duration-300 border-2 relative group ${
                                isSelected
                                  ? isActive
                                    ? `${category.color} ring-2 ring-red-500 shadow-lg scale-105` // Border đỏ cho active tab
                                    : `${category.color} ${category.borderColor} border-opacity-100 shadow-lg scale-105` // Border màu của category cho selected
                                  : `${category.color} ${category.hoverColor} border-transparent hover:scale-105 hover:shadow-md`
                              }`}
                            >
                              {isCompleted && (
                                <div className="absolute -top-2 -right-2 h-6 w-6 bg-white text-green-600 rounded-full flex items-center justify-center shadow-lg">
                                  <Check className="h-3 w-3" />
                                </div>
                              )}
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-lg">{category.icon}</span>
                                <span className="text-xs leading-tight">
                                  {category.name}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Active Category Detail */}
                    {(() => {
                      const activeCategoryId = categoriesState.find(
                        (c) => c.isActive,
                      )?.id;
                      const activeCategory = activeCategoryId
                        ? feedbackData.categories.find(
                            (c) => c.id === activeCategoryId,
                          )
                        : null;
                      const activeCategoryConfig = activeCategory
                        ? feedbackCategories.find(
                            (c) => c.id === activeCategory.id,
                          )
                        : null;

                      return activeCategory &&
                        activeCategoryConfig &&
                        activeCategory.selected ? (
                        <div className="space-y-6">
                          <div className="space-y-6">
                            {/* Rating Section */}
                            <div>
                              <Label className="text-sm font-medium text-gray-600 mb-3 block">
                                Mức đánh giá
                              </Label>
                              <div className="flex flex-col items-center space-y-3">
                                {renderStars(activeCategory.rating, (star) =>
                                  updateCategoryRating(activeCategory.id, star),
                                )}
                                <div
                                  className={`text-sm font-medium ${getRatingColor(activeCategory.rating)}`}
                                >
                                  {getRatingText(activeCategory.rating)}
                                </div>
                              </div>
                            </div>

                            {/* Note Section */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Chi tiết cụ thể
                                {(activeCategory.rating > 0 &&
                                  activeCategory.rating <= 2) ||
                                (feedbackImages[activeCategory.id] &&
                                  feedbackImages[activeCategory.id].trim() !==
                                    "") ? (
                                  <span className="text-red-500 text-xs">
                                    *
                                  </span>
                                ) : null}
                              </Label>
                              <Textarea
                                value={activeCategory.note}
                                onChange={(e) =>
                                  updateCategoryNote(
                                    activeCategory.id,
                                    e.target.value,
                                  )
                                }
                                onPaste={(e) =>
                                  handlePasteImage(e, activeCategory.id)
                                }
                                placeholder={activeCategoryConfig.placeholder}
                                className={`min-h-[120px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                                  ((activeCategory.rating > 0 &&
                                    activeCategory.rating <= 2) ||
                                    (feedbackImages[activeCategory.id] &&
                                      feedbackImages[
                                        activeCategory.id
                                      ].trim() !== "")) &&
                                  !activeCategory.note.trim()
                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                    : ""
                                }`}
                                maxLength={500}
                              />
                              {feedbackImages[activeCategory.id] && (
                                <div className="mt-2">
                                  <div className="flex flex-wrap gap-2">
                                    <div className="relative inline-block">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openImageModal(
                                            feedbackImages[activeCategory.id],
                                            0,
                                            1,
                                            activeCategory.id,
                                          )
                                        }
                                        className="p-0 border-0 bg-transparent"
                                      >
                                        <img
                                          src={
                                            feedbackImages[activeCategory.id]
                                          }
                                          alt="Screenshot"
                                          className="h-20 w-20 object-cover rounded border shadow hover:opacity-80 transition-opacity"
                                        />
                                      </button>
                                      <button
                                        type="button"
                                        className="absolute -top-1 -right-1 bg-white bg-opacity-90 rounded-full p-1 hover:bg-red-100 border border-gray-200"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Ngăn không cho mở modal khi click nút xóa
                                          setFeedbackImages((prev) => ({
                                            ...prev,
                                            [activeCategory.id]: "",
                                          }));
                                        }}
                                        title="Xóa ảnh"
                                      >
                                        <X className="h-3 w-3 text-red-500" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    1/1 ảnh
                                  </div>
                                </div>
                              )}
                              <div className="text-xs text-gray-500 text-right">
                                {activeCategory.note.length}/500
                              </div>
                              {(activeCategory.rating > 0 &&
                                activeCategory.rating <= 2) ||
                              (feedbackImages[activeCategory.id] &&
                                feedbackImages[activeCategory.id].trim() !==
                                  "") ? (
                                <div className="text-xs text-red-600">
                                  {activeCategory.rating > 0 &&
                                    activeCategory.rating <= 2 &&
                                    `* Bắt buộc khi đánh giá ${activeCategory.rating} sao`}
                                  {feedbackImages[activeCategory.id] &&
                                    feedbackImages[activeCategory.id].trim() !==
                                      "" &&
                                    activeCategory.rating > 2 &&
                                    "* Bắt buộc khi có hình ảnh"}
                                  {activeCategory.rating > 0 &&
                                    activeCategory.rating <= 2 &&
                                    feedbackImages[activeCategory.id] &&
                                    feedbackImages[activeCategory.id].trim() !==
                                      "" &&
                                    " hoặc khi có hình ảnh"}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {/* Device Status Section - Only for machines tab */}
                          {activeCategory.id === "machines" && (
                            <div className="space-y-4">
                              <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Info className="h-4 w-4" />
                                Trạng thái thiết bị
                              </Label>

                              {isLoadingDevice ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                  <span className="ml-2 text-gray-600">
                                    Đang tải thông tin thiết bị...
                                  </span>
                                </div>
                              ) : currentDeviceStatus ? (
                                <>
                                  {/* Show message when all devices are GOOD */}
                                  {allDevicesGood && (
                                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                      <div className="flex items-start gap-3">
                                        <div className="text-green-600 mt-0.5">
                                          <Check className="h-5 w-5" />
                                        </div>
                                        <div>
                                          <p className="text-sm text-green-800 leading-relaxed">
                                            🎉 Tuyệt vời! Tất cả thiết bị của
                                            bạn đều hoạt động tốt. Nếu bạn có
                                            góp ý về máy móc hoặc thiết bị khác,
                                            vui lòng chia sẻ bên dưới.
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="space-y-4">
                                    {deviceItems.map((item) => {
                                      const IconComponent = item.icon;
                                      const currentStatus =
                                        currentDeviceStatus[
                                          item.field as keyof DeviceStatus
                                        ];
                                      const selectedStatus =
                                        deviceFeedback[
                                          item.field as keyof DeviceFeedback
                                        ];

                                      return (
                                        <div
                                          key={item.id}
                                          className="p-4 border rounded-lg bg-gray-50"
                                        >
                                          <div className="flex items-center gap-3 mb-3">
                                            <IconComponent className="h-5 w-5 text-gray-600" />
                                            <span className="font-medium text-gray-800">
                                              {item.name}
                                            </span>
                                            {currentStatus !== "GOOD" && (
                                              <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                  currentStatus ===
                                                  "DAMAGED_BUT_USABLE"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}
                                              >
                                                {currentStatus ===
                                                "DAMAGED_BUT_USABLE"
                                                  ? "Hỏng nhẹ"
                                                  : "Hỏng nặng"}
                                              </span>
                                            )}
                                          </div>

                                          <div className="space-y-2">
                                            {deviceStatusOptions.map(
                                              (option) => (
                                                <label
                                                  key={option.value}
                                                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                                                    selectedStatus ===
                                                    option.value
                                                      ? `${option.bgColor} border-2 border-current`
                                                      : "hover:bg-gray-100 border-2 border-transparent"
                                                  }`}
                                                >
                                                  <input
                                                    type="radio"
                                                    name={item.field}
                                                    value={option.value}
                                                    checked={
                                                      selectedStatus ===
                                                      option.value
                                                    }
                                                    onChange={() =>
                                                      updateDeviceStatus(
                                                        item.field as keyof DeviceFeedback,
                                                        option.value as any,
                                                      )
                                                    }
                                                    className="sr-only"
                                                  />
                                                  <div
                                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                      selectedStatus ===
                                                      option.value
                                                        ? "border-current bg-current"
                                                        : "border-gray-300"
                                                    }`}
                                                  >
                                                    {selectedStatus ===
                                                      option.value && (
                                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                                    )}
                                                  </div>
                                                  <span
                                                    className={`font-medium ${option.color}`}
                                                  >
                                                    {option.label}
                                                  </span>
                                                </label>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              ) : (
                                <div className="text-center py-8 text-gray-500">
                                  Không thể tải thông tin thiết bị
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmit}
                      disabled={(() => {
                        const validCategories = selectedCategories.filter(
                          (cat) =>
                            cat.rating > 0 ||
                            (cat.note && cat.note.trim() !== ""),
                        );
                        if (validCategories.length === 0) return true;

                        // Kiểm tra các category có hình ảnh có đủ rating và comment không
                        const categoriesWithImages = validCategories.filter(
                          (cat) =>
                            feedbackImages[cat.id] &&
                            feedbackImages[cat.id].trim() !== "",
                        );

                        const hasIncompleteImageCategories =
                          categoriesWithImages.some(
                            (cat) =>
                              cat.rating === 0 ||
                              !cat.note ||
                              cat.note.trim() === "",
                          );

                        return hasIncompleteImageCategories;
                      })()}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Gửi Phản Hồi
                    </Button>
                  </div>
                </>
              ) : (
                /* Summary View */
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="text-green-600 mt-0.5">
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-green-800 leading-relaxed">
                          Vui lòng xem lại thông tin feedback trước khi gửi. Sau
                          khi gửi, bạn sẽ nhận được phần quà ghi nhận.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedCategories
                      .filter(
                        (category) =>
                          category.rating > 0 ||
                          (category.note && category.note.trim() !== ""),
                      ) // Hiển thị các category có rating hoặc có note
                      .map((category) => {
                        const catConfig = feedbackCategories.find(
                          (c) => c.id === category.id,
                        );
                        return (
                          <div
                            key={category.id}
                            className="p-4 border rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-xl">{catConfig?.icon}</span>
                              <span className="font-semibold text-gray-700">
                                {category.name}
                              </span>
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-medium text-white ${catConfig?.color} shadow-sm`}
                              >
                                {category.rating}/5
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="font-medium text-gray-600">
                                  Đánh giá:
                                </span>
                                <span
                                  className={`ml-2 ${getRatingColor(category.rating)}`}
                                >
                                  {getRatingText(category.rating)}
                                </span>
                              </div>

                              {/* Device Status - Only for machines category */}
                              {category.id === "machines" &&
                                currentDeviceStatus && (
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-600">
                                      Trạng thái thiết bị:
                                    </span>
                                    <div className="mt-1 space-y-1">
                                      {deviceItems.map((item) => {
                                        const IconComponent = item.icon;
                                        const status =
                                          deviceFeedback[
                                            item.field as keyof DeviceFeedback
                                          ];
                                        const statusOption =
                                          deviceStatusOptions.find(
                                            (opt) => opt.value === status,
                                          );

                                        return (
                                          <div
                                            key={item.id}
                                            className="flex items-center gap-2 text-xs"
                                          >
                                            <IconComponent className="h-3 w-3 text-gray-500" />
                                            <span className="text-gray-600">
                                              {item.name}:
                                            </span>
                                            <span
                                              className={`font-medium ${statusOption?.color}`}
                                            >
                                              {statusOption?.label}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                              {/* Note - Only show if there's content */}
                              {category.note && category.note.trim() !== "" && (
                                <div className="text-sm">
                                  <span className="font-medium text-gray-600">
                                    Chi tiết:
                                  </span>
                                  <p className="mt-1 text-gray-700 bg-white p-2 rounded border">
                                    {category.note}
                                  </p>
                                </div>
                              )}

                              {/* Images - Only show if there are images */}
                              {feedbackImages[category.id] &&
                                feedbackImages[category.id].trim() !== "" && (
                                  <div className="text-sm">
                                    <span className="font-medium text-gray-600">
                                      Hình ảnh:
                                    </span>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <div className="relative inline-block">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            openImageModal(
                                              feedbackImages[category.id],
                                              0,
                                              1,
                                              category.id,
                                            )
                                          }
                                          className="p-0 border-0 bg-transparent"
                                        >
                                          <img
                                            src={feedbackImages[category.id]}
                                            alt="Screenshot"
                                            className="h-16 w-16 object-cover rounded border shadow hover:opacity-80 transition-opacity"
                                          />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      1 ảnh
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowSummary(false)}
                      variant="outline"
                      className="flex-1 h-12"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Quay lại chỉnh sửa
                    </Button>
                    <Button
                      onClick={handleSubmitFeedback}
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 h-12"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Đang gửi...
                        </div>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Gửi Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Modal - Lightbox */}
      {imageModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
          <div className="relative max-w-full max-h-full">
            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
              title="Đóng (ESC)"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Navigation buttons - Only show if there are multiple images */}
            {imageModal.totalImages > 1 && (
              <>
                <button
                  onClick={() => navigateImage("prev")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
                  title="Ảnh trước (←)"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => navigateImage("next")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
                  title="Ảnh tiếp (→)"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Image counter - Only show if there are multiple images */}
            {imageModal.totalImages > 1 && (
              <div className="absolute -top-12 left-0 text-white text-sm">
                {imageModal.imageIndex + 1} / {imageModal.totalImages}
              </div>
            )}

            {/* Main image */}
            <img
              src={imageModal.imageUrl}
              alt={`Screenshot ${imageModal.imageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Click outside to close */}
          <div className="absolute inset-0 -z-10" onClick={closeImageModal} />
        </div>
      )}
    </>
  );
};

export default Feedback;
