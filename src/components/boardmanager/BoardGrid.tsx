import React, { useEffect, useState } from "react";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  Timestamp, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebase";
import BoardCard from "./BoardCard";
import { useNavigate } from "react-router-dom";

interface Board {
  id: string;
  title: string;
  lastEdited: Timestamp;
  thumbnail: string;
}

const BoardGrid = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setBoards([]);
        setLoading(false);
        return;
      }

      try {
        await fetchBoards(user.uid);
      } catch (err) {
        console.error("❌ Error fetching boards:", err);
        setError("Failed to load boards. Please try again later.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch boards function that can be reused
  const fetchBoards = async (userId: string) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "boards"), 
        where("userId", "==", userId)
      );
      
      const snapshot = await getDocs(q);
      const fetchedBoards = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "Untitled Board",
          lastEdited: data.lastEdited,
          thumbnail: data.thumbnail || "https://via.placeholder.com/150"
        };
      });

      setBoards(fetchedBoards);
    } catch (err) {
      console.error("❌ Error fetching boards:", err);
      setError("Failed to load boards. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const convertToDate = (timestamp: Timestamp) => {
    try {
      return timestamp.toDate();
    } catch (e) {
      console.warn("Invalid timestamp, using current date");
      return new Date();
    }
  };
    const handleOpenBoard = (id: string) => {
      navigate(`/drawing/${id}`);  // Use the /drawing path
    };

  // Handle delete board with confirmation
  const handleDeleteBoard = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this board?")) {
      return;
    }

    try {
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to delete boards");
        return;
      }

      // Delete from Firestore
      await deleteDoc(doc(db, "boards", id));
      
      // Optimistically update UI
      setBoards(prev => prev.filter(board => board.id !== id));
      
      console.log("✅ Board deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting board:", error);
      alert("Failed to delete board. Please try again.");
      // Refresh board list in case of error
      if (auth.currentUser) {
        fetchBoards(auth.currentUser.uid);
      }
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 mt-8">Loading your boards...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-8">{error}</p>;
  }

  if (boards.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No boards found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {boards.map((board) => (
        <BoardCard
          key={board.id}
          id={board.id}
          title={board.title}
          lastEdited={convertToDate(board.lastEdited)}
          thumbnail={board.thumbnail}
          onOpen={handleOpenBoard}
          onShare={(id) => console.log("Share", id)}
          onDuplicate={(id) => console.log("Duplicate", id)}
          onDelete={handleDeleteBoard} // Pass delete handler
        />
      ))}
    </div>
  );
};

export default BoardGrid;