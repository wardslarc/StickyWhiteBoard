import React from "react";

const Settings = () => {
  return (
    <div className="p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Whiteboard Templates</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Basic Template</span>
              <div className="space-x-2">
                <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
                  Edit
                </button>
                <button className="px-3 py-1 text-sm border rounded text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Project Planning</span>
              <div className="space-x-2">
                <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
                  Edit
                </button>
                <button className="px-3 py-1 text-sm border rounded text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Brainstorming</span>
              <div className="space-x-2">
                <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
                  Edit
                </button>
                <button className="px-3 py-1 text-sm border rounded text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Add New Template
            </button>
          </div>
        </div>
        <div className="border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Default Settings</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Default Note Colors
              </label>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-yellow-200 rounded-full border"></div>
                <div className="w-8 h-8 bg-blue-200 rounded-full border"></div>
                <div className="w-8 h-8 bg-green-200 rounded-full border"></div>
                <div className="w-8 h-8 bg-pink-200 rounded-full border"></div>
                <div className="w-8 h-8 bg-purple-200 rounded-full border"></div>
                <button className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-400">
                  +
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Auto-save Interval
              </label>
              <select className="w-full border rounded-md p-2">
                <option>30 seconds</option>
                <option>1 minute</option>
                <option>2 minutes</option>
                <option>5 minutes</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Max Users per Whiteboard
              </label>
              <input
                type="number"
                className="w-full border rounded-md p-2"
                defaultValue="10"
              />
            </div>
            <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
