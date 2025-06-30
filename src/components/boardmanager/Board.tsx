"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import BoardGrid from "./BoardGrid";
import CreateBoardDialog from "./CreateBoardDialog";

import { db, auth } from "@/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

interface BoardData {
  id: string;
  title: string;
  thumbnail: string;
  lastEdited: Timestamp | string;
}

export default function Board() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [boards, setBoards] = useState<BoardData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });
    return unsubscribe;
  }, []);

  // Fetch boards when userId is set
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "whiteboards"),
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBoards: BoardData[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        thumbnail: doc.data().thumbnail,
        lastEdited: doc.data().lastEdited,
      }));
      setBoards(fetchedBoards);
    });

    return unsubscribe;
  }, [userId]);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <p>Loading user...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">StickyWhiteboard</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123" />
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut(auth)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main */}
      <main className="container px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">My Boards</h2>
            {/* Create Board Dialog */}
            <CreateBoardDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              userId={userId}
            />
        </div>

        <BoardGrid
          boards={boards}
          onDelete={() => {}}
          onDuplicate={() => {}}
        />
        
    
      </main>
    </div>
  );
}