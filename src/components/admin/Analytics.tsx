import React from "react";

const Analytics = () => {
  return (
    <div className="p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Usage Statistics</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            Chart placeholder: Daily Active Users
          </div>
        </div>
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Engagement Metrics</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            Chart placeholder: Time Spent per User
          </div>
        </div>
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Note Creation Rate</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            Chart placeholder: Notes Created Over Time
          </div>
        </div>
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Feature Usage</h2>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            Chart placeholder: Feature Usage Breakdown
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
