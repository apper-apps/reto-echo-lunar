import React from "react";

const Loading = ({ className = "" }) => {
  return (
    <div className={`animate-pulse space-y-6 ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-purple-200 to-blue-200 rounded w-32"></div>
          <div className="h-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded w-24"></div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-200 to-blue-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gradient-to-r from-purple-200 to-blue-200 rounded w-3/4"></div>
                <div className="h-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded w-full"></div>
              <div className="h-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded w-5/6"></div>
              <div className="h-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;