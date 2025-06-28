// whiteboardTypes.ts
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
}

export interface DrawingPath {
  id: string;
  points: Position[];
  color: string;
  strokeWidth: number;
  tool: DrawingTool;
}

export interface Shape {
  id: string;
  type: "rectangle" | "circle";
  startPos: Position;
  endPos: Position;
  color: string;
  strokeWidth: number;
}

export type DrawingTool = "select" | "pen" | "brush" | "eraser" | "rectangle" | "circle";