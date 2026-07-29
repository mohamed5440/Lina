import React, { useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, Eye, EyeOff, Lock, User } from "lucide-react";
import { Input } from "../ui/ui";
import Modal from "../ui/Modal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.token);
        onClose();
      } else {
        setError(data.error || "اسم المستخدم أو كلمة المرور غير صحيحة!");
      }
    } catch (err) {
      console.error("Error logging in:", err);
      setError("حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="تسجيل دخول آمن إلى لوحة التحكم"
      icon={<Lock size={16} />}
      className="w-full max-w-md bg-white text-stone-900 rounded-xl overflow-hidden border border-stone-200 shadow-2xl relative z-10 flex flex-col"
    >
      {/* Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200/80 text-rose-700 rounded-xl text-xs sm:text-sm font-bold"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Username */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-extrabold text-stone-900 flex items-center gap-2">
            <User size={15} className="text-stone-700" />
            <span>اسم المستخدم</span>
          </label>
          <Input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="أدخل اسم المستخدم"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-extrabold text-stone-900 flex items-center gap-2">
            <Lock size={15} className="text-stone-700" />
            <span>كلمة المرور</span>
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              className="pl-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-stone-200/60 text-stone-600 hover:text-stone-950 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full bg-stone-900 hover:bg-black text-white font-bold py-3.5 text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? "جاري التحقق..." : "تسجيل الدخول"}
        </motion.button>
      </form>
    </Modal>
  );
}
