import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash } from "lucide-react";
import { Button } from "./ui";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  className = "relative w-full max-w-md bg-white text-stone-900 rounded-xl overflow-hidden border border-stone-200 shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]",
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
          dir="rtl"
          onClick={onClose}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={className}
            >
              {title && (
                <div className="px-6 py-4.5 flex items-center justify-between border-b border-stone-200 bg-[#FFFFFF] shrink-0">
                  <h3 className="font-black text-base sm:text-lg flex items-center gap-2 text-stone-900">
                    {icon}
                    <span>{title}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-xl hover:bg-stone-100 transition-colors text-stone-600 hover:text-stone-950 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-full max-w-sm bg-white rounded-xl p-6 border border-stone-200 shadow-2xl text-center space-y-4"
    >
      <div className="w-14 h-14 bg-rose-50 text-rose-600 border border-rose-200/60 rounded-full flex items-center justify-center mx-auto">
        <Trash size={24} />
      </div>
      <div className="space-y-1.5">
        <h4 className="font-extrabold text-base sm:text-lg text-stone-900">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex gap-3 pt-2">
        <Button onClick={onConfirm} variant="danger" className="flex-1">
          {confirmText}
        </Button>
        <Button onClick={onClose} variant="secondary" className="flex-1">
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}
