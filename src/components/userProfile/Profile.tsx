import React from "react";
import ProfileSettingsTabs from "./ProfileSettingsTabs";

const Home = () => {
  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 mt-2">
            Manage your account preferences and personal information
          </p>
        </header>

        <main>
          <ProfileSettingsTabs />
        </main>

        <footer className="mt-16 pt-6 border-t border-gray-100 text-sm text-gray-400">
          <p>
            © {new Date().getFullYear()} StickyWhiteBoard. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
