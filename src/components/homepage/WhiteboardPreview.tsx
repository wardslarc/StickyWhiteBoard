import React from "react";
import { motion } from "framer-motion";

interface StickyNote {
  id: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  rotation: number;
}

interface DrawingLine {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface WhiteboardPreviewProps {
  stickyNotes?: StickyNote[];
  drawings?: DrawingLine[];
  interactive?: boolean;
}

const WhiteboardPreview: React.FC<WhiteboardPreviewProps> = ({
  stickyNotes = [
    {
      id: "1",
      content: "Project kickoff meeting",
      color: "#FFCC80",
      position: { x: 50, y: 50 },
      rotation: -2,
    },
    {
      id: "2",
      content: "Design sprint next week",
      color: "#80DEEA",
      position: { x: 250, y: 100 },
      rotation: 3,
    },
    {
      id: "3",
      content: "Remember to update docs",
      color: "#EF9A9A",
      position: { x: 150, y: 200 },
      rotation: -1,
    },
    {
      id: "4",
      content: "Team lunch on Friday!",
      color: "#C5E1A5",
      position: { x: 350, y: 250 },
      rotation: 2,
    },
  ],
  drawings = [
    {
      points: [
        { x: 100, y: 80 },
        { x: 200, y: 120 },
        { x: 300, y: 80 },
        { x: 400, y: 150 },
      ],
      color: "#5C6BC0",
      width: 2,
    },
    {
      points: [
        { x: 200, y: 300 },
        { x: 250, y: 320 },
        { x: 300, y: 310 },
        { x: 350, y: 330 },
      ],
      color: "#7E57C2",
      width: 3,
    },
    {
      points: [
        { x: 50, y: 350 },
        { x: 100, y: 320 },
        { x: 150, y: 350 },
      ],
      color: "#EC407A",
      width: 2,
    },
  ],
  interactive = false,
}) => {
  // Function to draw a line on the canvas
  const renderDrawing = (drawing: DrawingLine) => {
    if (drawing.points.length < 2) return null;

    const pathData = drawing.points.reduce((path, point, index) => {
      return (
        path +
        (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`)
      );
    }, "");

    return (
      <path
        d={pathData}
        stroke={drawing.color}
        strokeWidth={drawing.width}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  return (
    <div className="relative w-full h-full max-w-[800px] max-h-[450px] mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* Whiteboard header */}
      <div className="bg-gray-50 p-2 border-b border-gray-200 flex justify-between items-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="text-sm font-medium text-gray-500">Team Whiteboard</div>
        <div className="flex space-x-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600 font-medium">
            JD
          </div>
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs text-green-600 font-medium">
            AS
          </div>
          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs text-purple-600 font-medium">
            +3
          </div>
        </div>
      </div>

      {/* Whiteboard canvas */}
      <div className="relative w-full h-[400px] bg-white bg-opacity-90 bg-[radial-gradient(#e0e0e0_1px,transparent_1px)] bg-[size:20px_20px]">
        {/* Drawings */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {drawings.map((drawing, index) => (
            <g key={`drawing-${index}`}>{renderDrawing(drawing)}</g>
          ))}
        </svg>

        {/* Sticky notes */}
        {stickyNotes.map((note) => (
          <motion.div
            key={note.id}
            className="absolute shadow-md p-3 w-[150px] h-[150px] flex items-center justify-center text-center text-sm font-medium"
            style={{
              backgroundColor: note.color,
              left: note.position.x,
              top: note.position.y,
              rotate: `${note.rotation}deg`,
              cursor: interactive ? "grab" : "default",
            }}
            whileHover={interactive ? { scale: 1.05 } : {}}
            whileTap={interactive ? { scale: 0.95 } : {}}
            drag={interactive}
            dragConstraints={{ left: 0, right: 650, top: 0, bottom: 350 }}
          >
            {note.content}
          </motion.div>
        ))}

        {/* Toolbar (simplified) */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2 flex space-x-4">
          <button className="w-8 h-8 rounded-full bg-yellow-200 hover:bg-yellow-300 transition-colors"></button>
          <button className="w-8 h-8 rounded-full bg-blue-200 hover:bg-blue-300 transition-colors"></button>
          <button className="w-8 h-8 rounded-full bg-pink-200 hover:bg-pink-300 transition-colors"></button>
          <button className="w-8 h-8 rounded-full bg-green-200 hover:bg-green-300 transition-colors"></button>
          <div className="h-8 w-px bg-gray-200"></div>
          <button className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
              <path d="M2 2l7.586 7.586"></path>
              <circle cx="11" cy="11" r="2"></circle>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardPreview;
