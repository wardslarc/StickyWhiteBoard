// whiteboardTypes.ts
import { Timestamp } from "firebase/firestore";

export interface Position {
  x: number;
  y: number;
}

export interface Note {
  id: string;
  content: string;
  position: Position;
  color: string;
  zIndex: number;
  boardId: string; // Added boardId reference
  userId?: string; // Optional user ID for creator
}

export interface DrawingPath {
  id: string;
  points: Position[];
  color: string;
  strokeWidth: number;
  tool: DrawingTool;
  boardId: string; // Added boardId reference
}

export interface Shape {
  id: string;
  type: "rectangle" | "circle";
  startPos: Position;
  endPos: Position;
  color: string;
  strokeWidth: number;
  boardId: string; // Added boardId reference
}

export type DrawingTool = "select" | "pen" | "brush" | "eraser" | "rectangle" | "circle";

// New board interface
export interface Board {
  id: string;
  title: string;
  userId: string; // Owner's user ID
  lastEdited?: Timestamp;
  thumbnail?: string;
  // For future collaboration features:
  participants?: string[]; // Array of user IDs
}