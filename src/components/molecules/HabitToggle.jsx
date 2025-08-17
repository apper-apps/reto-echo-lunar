import React from "react";
import ApperIcon from "@/components/ApperIcon";

const HabitToggle = ({ 
  habit, 
  status = "incomplete", 
  onToggle,
  className = ""
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return "CheckCircle2";
      case "partial":
        return "Clock";
      default:
        return "Circle";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "text-emerald-500";
      case "partial":
        return "text-yellow-500";
      default:
        return "text-gray-400";
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 border-emerald-200";
      case "partial":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${getBackgroundColor()} ${className}`}
      onClick={() => onToggle && onToggle(habit.id)}
    >
      <div className="flex items-center space-x-3">
        <ApperIcon 
          name={getStatusIcon()} 
          className={`h-6 w-6 ${getStatusColor()}`}
        />
        <div>
          <h4 className="font-medium text-gray-900">{habit.name}</h4>
          <p className="text-sm text-gray-600">{habit.category}</p>
        </div>
      </div>
      
      {habit.target && (
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {habit.currentValue || 0} / {habit.target}
          </div>
          <div className="text-xs text-gray-600">{habit.unit}</div>
        </div>
      )}
    </div>
  );
};

export default HabitToggle;