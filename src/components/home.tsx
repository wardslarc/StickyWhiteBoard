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


      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <Whiteboard />
        </div>
      </main>
    </div>
  );
};

export default Home;
