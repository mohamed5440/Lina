import React from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900 py-2.5 px-4 rounded-xl outline-none text-xs sm:text-sm font-medium text-stone-900 transition-all placeholder:text-stone-400 placeholder:font-normal ${className}`}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`w-full bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900 py-2.5 px-4 rounded-xl outline-none text-xs sm:text-sm font-semibold text-stone-900 transition-all cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`w-full bg-stone-50 border border-stone-200 focus:border-stone-900 focus:bg-white focus:ring-1 focus:ring-stone-900 py-2.5 px-4 rounded-xl outline-none text-xs sm:text-sm font-medium text-stone-900 transition-all placeholder:text-stone-400 placeholder:font-normal resize-none ${className}`}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger";
  }
>(({ className = "", variant = "primary", ...props }, ref) => {
  const variants = {
    primary:
      "bg-stone-900 hover:bg-black text-white border-transparent focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 shadow-xs",
    secondary:
      "bg-stone-100 hover:bg-stone-200 text-stone-900 border-stone-200 border focus:ring-2 focus:ring-stone-200 focus:ring-offset-2",
    danger:
      "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 border focus:ring-2 focus:ring-rose-500 focus:ring-offset-2",
  };
  return (
    <button
      ref={ref}
      className={`py-2.5 sm:py-3 px-5 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 outline-none active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
});
Button.displayName = "Button";
