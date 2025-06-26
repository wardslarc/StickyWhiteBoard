import React, { useState, useRef, useEffect, useCallback } from "react";
import StickyNote from "./StickyNote";
import Toolbar, { DrawingTool } from "./Toolbar";
import { motion } from "framer-motion";

interface Position {
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

const Whiteboard = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      content: "Welcome to the whiteboard! Drag me around.",
      position: { x: 100, y: 100 },
      color: "#ffcc80",
      zIndex: 1,
    },
    {
      id: "2",
      content: "Double-click to edit text.",
      position: { x: 400, y: 150 },
      color: "#80deea",
      zIndex: 2,
    },
    {
      id: "3",
      content: "Use the toolbar to add more notes!",
      position: { x: 250, y: 300 },
      color: "#ef9a9a",
      zIndex: 3,
    },
  ]);
  const [highestZIndex, setHighestZIndex] = useState<number>(3);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<DrawingTool>("select");
  const [drawingColor, setDrawingColor] = useState<string>("#000000");
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<Position[]>([]);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addNote = () => {
    const newZIndex = highestZIndex + 1;
    const newNote: Note = {
      id: Date.now().toString(),
      content: "New note",
      position: { x: 50, y: 50 },
      color: "#ffcc80",
      zIndex: newZIndex,
    };
    setNotes([...notes, newNote]);
    setHighestZIndex(newZIndex);
  };

  const updateNotePosition = (id: string, position: Position) => {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, position } : note)),
    );
  };

  const updateNoteContent = (id: string, content: string) => {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, content } : note)),
    );
  };

  const updateNoteColor = (id: string, color: string) => {
    setNotes(notes.map((note) => (note.id === id ? { ...note, color } : note)));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  };

  const bringToFront = (id: string) => {
    const newZIndex = highestZIndex + 1;
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, zIndex: newZIndex } : note,
      ),
    );
    setHighestZIndex(newZIndex);
  };

  const handleNoteSelect = (id: string) => {
    setSelectedNoteId(id);
    bringToFront(id);
  };

  const handleColorChange = (color: string) => {
    if (selectedNoteId) {
      updateNoteColor(selectedNoteId, color);
    }
  };

  const handleDelete = () => {
    if (selectedNoteId) {
      deleteNote(selectedNoteId);
    }
  };

  const handleIncreaseSize = () => {
    // TODO: Implement size increase functionality
  };

  const handleDecreaseSize = () => {
    // TODO: Implement size decrease functionality
  };

  const handleToolChange = (tool: DrawingTool) => {
    setSelectedTool(tool);
    if (tool !== "select") {
      setSelectedNoteId(null);
    }
  };

  const handleDrawingColorChange = (color: string) => {
    setDrawingColor(color);
  };

  const getMousePosition = useCallback((e: React.MouseEvent) => {
    if (!whiteboardRef.current) return { x: 0, y: 0 };
    const rect = whiteboardRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (selectedTool === "select") return;

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

  const handleMouseUp = useCallback(() => {
    if (selectedTool === "select" || !isDrawing) return;

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
  }, [selectedTool, isDrawing, currentPath, drawingColor, currentShape]);

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
    const whiteboard = whiteboardRef.current;
    if (!canvas || !whiteboard) return;

    const resizeCanvas = () => {
      canvas.width = whiteboard.clientWidth;
      canvas.height = whiteboard.clientHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-gray-100">
      <Toolbar
        onAddNote={addNote}
        onColorChange={handleColorChange}
        onDelete={handleDelete}
        onIncreaseSize={handleIncreaseSize}
        onDecreaseSize={handleDecreaseSize}
        selectedNoteId={selectedNoteId}
        selectedTool={selectedTool}
        onToolChange={handleToolChange}
        drawingColor={drawingColor}
        onDrawingColorChange={handleDrawingColorChange}
      />
      <motion.div
        ref={whiteboardRef}
        className="flex-grow relative overflow-hidden bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: selectedTool !== "select" ? "crosshair" : "default" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10"
        />
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            id={note.id}
            initialX={note.position.x}
            initialY={note.position.y}
            initialColor={note.color}
            initialContent={note.content}
            onDelete={() => deleteNote(note.id)}
            onContentChange={(id, content) => updateNoteContent(id, content)}
            onPositionChange={(id, x, y) => updateNotePosition(id, { x, y })}
            onSelect={() => handleNoteSelect(note.id)}
            isSelected={selectedNoteId === note.id}
            selectedTool={selectedTool}
            drawingColor={drawingColor}
            style={{ zIndex: note.zIndex }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default Whiteboard;
