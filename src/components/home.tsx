import React from "react";
import Whiteboard from "./Whiteboard";


const Home = () => {
  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Sticky Notes Whiteboard
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
          <Whiteboard />
        </div>
      </main>
    </div>
  );
};

export default Home;
