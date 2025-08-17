import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";

const MetricCard = ({ 
  title, 
  value, 
  unit = "", 
  change = null,
  icon,
  gradient = false,
  className = ""
}) => {
  return (
    <Card className={`p-6 ${className}`} gradient={gradient}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-lg">
            <ApperIcon name={icon} className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
      </div>
      
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {unit && (
          <span className="text-sm text-gray-600">{unit}</span>
        )}
      </div>
      
      {change && (
        <div className={`flex items-center mt-2 text-sm ${
          change.type === 'positive' ? 'text-emerald-600' : 
          change.type === 'negative' ? 'text-red-600' : 'text-gray-600'
        }`}>
          <ApperIcon 
            name={change.type === 'positive' ? 'TrendingUp' : 'TrendingDown'} 
            className="h-4 w-4 mr-1" 
          />
          {change.value}
        </div>
      )}
    </Card>
  );
};

export default MetricCard;