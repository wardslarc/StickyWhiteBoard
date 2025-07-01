import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Edit2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { DrawingTool } from "./Toolbar";
import { Position } from "./whiteboardTypes";

interface StickyNoteProps {
  id: string;
  initialX: number;
  initialY: number;
  initialColor: string;
  initialContent: string;
  onDelete: () => void;
  onContentChange: (id: string, content: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSelect: () => void;
  isSelected: boolean;
  selectedTool: DrawingTool;
  drawingColor: string;
  style: React.CSSProperties;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  id,
  initialX = 100,
  initialY = 100,
  initialColor = "#FFEB3B",
  initialContent = "Add your note here...",
  onDelete,
  onContentChange,
  onPositionChange,
  onSelect,
  isSelected = false,
  selectedTool = "select",
  drawingColor = "#000000",
  style = {},
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [color, setColor] = useState(initialColor);
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update local state when props change
  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: initialX, y: initialY });
    }
    setContent(initialContent);
    setColor(initialColor);
  }, [initialX, initialY, initialContent, initialColor, isDragging]);

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y
    };
    setPosition(newPosition);
    onPositionChange(id, newPosition.x, newPosition.y);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange(id, newContent);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleNoteClick = (e: React.MouseEvent) => {
    if (selectedTool === "select") {
      e.stopPropagation();
      onSelect();
    }
  };

  return (
    <motion.div
      ref={noteRef}
      drag={selectedTool === "select"}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      initial={{ x: position.x, y: position.y }}
      animate={{ x: position.x, y: position.y }}
      className={`absolute shadow-lg rounded-md overflow-hidden ${
        selectedTool !== "select" ? "cursor-crosshair" : "cursor-move"
      } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      style={{
        width: "200px",
        height: "auto",
        minHeight: "200px",
        backgroundColor: color,
        zIndex: style.zIndex,
        ...style,
      }}
      onClick={handleNoteClick}
    >
      <div className="p-2 flex justify-between items-center bg-black/10">
        <div className="flex space-x-1">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <Edit2 size={16} className="text-gray-700" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <Check size={16} className="text-gray-700" />
            </button>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <X size={16} className="text-gray-700" />
        </button>
      </div>
      <div className="p-3 relative">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onBlur={handleSave}
            className="w-full h-full min-h-[150px] bg-transparent resize-none focus:outline-none relative z-10"
            autoFocus
          />
        ) : (
          <div className="whitespace-pre-wrap break-words relative z-10">
            {content}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StickyNote;