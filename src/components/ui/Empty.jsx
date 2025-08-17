import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  title = "No hay datos disponibles",
  description = "Parece que aún no tienes información aquí",
  icon = "Inbox",
  actionText = null,
  onAction = null,
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="bg-gradient-to-br from-purple-100 via-blue-50 to-emerald-50 rounded-full p-8 mb-6">
        <ApperIcon 
          name={icon} 
          className="h-16 w-16 text-purple-400" 
        />
      </div>
      
      <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md">
        {description}
      </p>
      
      {actionText && onAction && (
        <Button 
          onClick={onAction}
          className="bg-gradient-to-r from-primary to-secondary hover:from-purple-700 hover:to-blue-700"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default Empty;