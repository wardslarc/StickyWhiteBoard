import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Edit2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { DrawingTool } from "./Toolbar";

interface Position {
  x: number;
  y: number;
}

interface DrawingPath {
  id: string;
  points: Position[];
  color: string;
  strokeWidth: number;
  tool: DrawingTool;
}

interface Shape {
  id: string;
  type: "rectangle" | "circle";
  startPos: Position;
  endPos: Position;
  color: string;
  strokeWidth: number;
}

interface StickyNoteProps {
  id: string;
  initialX?: number;
  initialY?: number;
  initialColor?: string;
  initialContent?: string;
  onDelete?: (id: string) => void;
  onContentChange?: (id: string, content: string) => void;
  onPositionChange?: (id: string, x: number, y: number) => void;
  onSelect?: () => void;
  isSelected?: boolean;
  selectedTool?: DrawingTool;
  drawingColor?: string;
  style?: React.CSSProperties;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  id,
  initialX = 100,
  initialY = 100,
  initialColor = "#FFEB3B",
  initialContent = "Add your note here...",
  onDelete = () => {},
  onContentChange = () => {},
  onPositionChange = () => {},
  onSelect = () => {},
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
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Position[]>([]);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    // Calculate the final position based on the drag offset
    const finalX = position.x + info.offset.x;
    const finalY = position.y + info.offset.y;

    setPosition({
      x: finalX,
      y: finalY,
    });
    onPositionChange(id, finalX, finalY);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSave = () => {
    setIsEditing(false);
    onContentChange(id, content);
  };

  const handleNoteClick = (e: React.MouseEvent) => {
    if (selectedTool === "select") {
      e.stopPropagation();
      onSelect();
    }
  };

  const getMousePosition = useCallback((e: React.MouseEvent) => {
    if (!noteRef.current) return { x: 0, y: 0 };
    const rect = noteRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (selectedTool === "select") return;
      e.stopPropagation();

      const pos = getMousePosition(e);

      if (selectedTool === "rectangle" || selectedTool === "circle") {
        const newShape: Shape = {
          id: Date.now().toString(),
          type: selectedTool,
          startPos: pos,
          endPos: pos,
          color: drawingColor,
          strokeWidth: selectedTool === "brush" ? 4 : 2,
        };
        setCurrentShape(newShape);
        setIsDrawing(true);
      } else {
        setIsDrawing(true);
        setCurrentPath([pos]);
      }
    },
    [selectedTool, getMousePosition, drawingColor],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (selectedTool === "select" || !isDrawing) return;
      e.stopPropagation();

      const pos = getMousePosition(e);

      if (selectedTool === "rectangle" || selectedTool === "circle") {
        if (currentShape) {
          setCurrentShape({
            ...currentShape,
            endPos: pos,
          });
        }
      } else {
        setCurrentPath((prev) => [...prev, pos]);
      }
    },
    [selectedTool, isDrawing, getMousePosition, currentShape],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (selectedTool === "select" || !isDrawing) return;
      e.stopPropagation();

      if (selectedTool === "rectangle" || selectedTool === "circle") {
        if (currentShape) {
          setShapes((prev) => [...prev, currentShape]);
          setCurrentShape(null);
        }
      } else if (currentPath.length > 1) {
        const strokeWidth =
          selectedTool === "brush" ? 4 : selectedTool === "eraser" ? 8 : 2;
        const newPath: DrawingPath = {
          id: Date.now().toString(),
          points: currentPath,
          color: selectedTool === "eraser" ? "#FFFFFF" : drawingColor,
          strokeWidth,
          tool: selectedTool,
        };
        setDrawingPaths((prev) => [...prev, newPath]);
      }

      setIsDrawing(false);
      setCurrentPath([]);
    },
    [selectedTool, isDrawing, currentPath, drawingColor, currentShape],
  );

  const drawPath = useCallback(
    (ctx: CanvasRenderingContext2D, path: DrawingPath) => {
      if (path.points.length < 2) return;

      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (path.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
      } else {
        ctx.globalCompositeOperation = "source-over";
      }

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }

      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    },
    [],
  );

  const drawShape = useCallback(
    (ctx: CanvasRenderingContext2D, shape: Shape) => {
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      ctx.fillStyle = "transparent";

      const width = shape.endPos.x - shape.startPos.x;
      const height = shape.endPos.y - shape.startPos.y;

      if (shape.type === "rectangle") {
        ctx.strokeRect(shape.startPos.x, shape.startPos.y, width, height);
      } else if (shape.type === "circle") {
        const centerX = shape.startPos.x + width / 2;
        const centerY = shape.startPos.y + height / 2;
        const radius = Math.sqrt(width * width + height * height) / 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    drawingPaths.forEach((path) => drawPath(ctx, path));

    // Draw all shapes
    shapes.forEach((shape) => drawShape(ctx, shape));

    // Draw current path being drawn
    if (
      isDrawing &&
      currentPath.length > 1 &&
      selectedTool !== "rectangle" &&
      selectedTool !== "circle"
    ) {
      const strokeWidth =
        selectedTool === "brush" ? 4 : selectedTool === "eraser" ? 8 : 2;
      const tempPath: DrawingPath = {
        id: "temp",
        points: currentPath,
        color: selectedTool === "eraser" ? "#FFFFFF" : drawingColor,
        strokeWidth,
        tool: selectedTool,
      };
      drawPath(ctx, tempPath);
    }

    // Draw current shape being drawn
    if (isDrawing && currentShape) {
      drawShape(ctx, currentShape);
    }
  }, [
    drawingPaths,
    shapes,
    currentPath,
    currentShape,
    isDrawing,
    drawingColor,
    selectedTool,
    drawPath,
    drawShape,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 200;
    canvas.height = 200;
  }, []);

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
        ...style,
      }}
      onClick={handleNoteClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
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
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ pointerEvents: selectedTool !== "select" ? "auto" : "none" }}
        />
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onBlur={handleSave}
            className="w-full h-full min-h-[150px] bg-transparent resize-none focus:outline-none relative z-10"
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
