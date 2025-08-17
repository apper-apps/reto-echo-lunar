import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  className = "",
  children,
  gradient = false,
  hover = false,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-2xl shadow-lg border border-purple-100 transition-all duration-200",
        gradient && "bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50 border-purple-200",
        hover && "hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;