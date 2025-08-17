import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Error = ({ 
  message = "Ha ocurrido un error inesperado", 
  onRetry = null,
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-full p-6 mb-6">
        <ApperIcon 
          name="AlertCircle" 
          className="h-12 w-12 text-red-500" 
        />
      </div>
      
      <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">
        ¡Ups! Algo salió mal
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <Button 
          onClick={onRetry}
          className="bg-gradient-to-r from-primary to-secondary hover:from-purple-700 hover:to-blue-700"
        >
          <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
          Intentar de nuevo
        </Button>
      )}
    </div>
  );
};

export default Error;