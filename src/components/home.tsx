import React from "react";
import Whiteboard from "./Whiteboard";
import UserProfileMenu from "./UserProfileMenu";
import { StickyNote, Share2, User } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const Home = () => {
  const handleShare = async () => {
    try {
      const shareURL = window.location.href;
      await navigator.clipboard.writeText(shareURL);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* App Title */}
            <div className="flex items-center space-x-3">
            <div className="h-8 w-8 flex items-center justify-center">
                  <img
                    src="/stickylogo.png"
                    alt="Logo"
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Sticky Notes Whiteboard
                </h1>
              </div>


            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>

              {/* Profile Icon Button with dropdown */}
              <UserProfileMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-gray-100"
                >
                  <User className="w-5 h-5 text-gray-700" />
                </Button>
              </UserProfileMenu>
            </div>
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
