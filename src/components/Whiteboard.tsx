import React, { useState, useRef, useEffect, useCallback } from "react";
import StickyNote from "./StickyNote";
import Toolbar, { DrawingTool } from "./Toolbar";
import { motion } from "framer-motion";
import { 
  db, 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  deleteDoc,
  writeBatch
} from "../firebase";
import { DrawingPath, Shape, Note, Position } from "./whiteboardTypes";

const Whiteboard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [highestZIndex, setHighestZIndex] = useState<number>(0);
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
  const [noteCreationColor, setNoteCreationColor] = useState<string>("#ffcc80");
  
  // Change to Sets to track entire elements for deletion
  const eraserSelectionRef = useRef<{ 
    paths: Set<string>; 
    shapes: Set<string> 
  }>({ 
    paths: new Set(), 
    shapes: new Set() 
  });

  // Firebase collection references
  const notesRef = collection(db, "notes");
  const drawingPathsRef = collection(db, "drawingPaths");
  const shapesRef = collection(db, "shapes");

  // Load all whiteboard data from Firestore
  useEffect(() => {
    // Load notes
    const notesUnsubscribe = onSnapshot(notesRef, (snapshot) => {
      const notesData: Note[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notesData.push({
          id: doc.id,
          content: data.content,
          position: data.position,
          color: data.color,
          zIndex: data.zIndex,
        });
      });
      setNotes(notesData);
      
      // Calculate highest zIndex
      if (notesData.length > 0) {
        const maxZIndex = Math.max(...notesData.map(note => note.zIndex));
        setHighestZIndex(maxZIndex);
      } else {
        setHighestZIndex(0);
      }
    });

    // Load drawing paths
    const pathsUnsubscribe = onSnapshot(drawingPathsRef, (snapshot) => {
      const pathsData: DrawingPath[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        pathsData.push({
          id: doc.id,
          points: data.points,
          color: data.color,
          strokeWidth: data.strokeWidth,
          tool: data.tool,
        });
      });
      setDrawingPaths(pathsData);
    });

    // Load shapes
    const shapesUnsubscribe = onSnapshot(shapesRef, (snapshot) => {
      const shapesData: Shape[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        shapesData.push({
          id: doc.id,
          type: data.type,
          startPos: data.startPos,
          endPos: data.endPos,
          color: data.color,
          strokeWidth: data.strokeWidth,
        });
      });
      setShapes(shapesData);
    });

    return () => {
      notesUnsubscribe();
      pathsUnsubscribe();
      shapesUnsubscribe();
    };
  }, []);

  // Add a new sticky note
  const addNote = async () => {
    const newZIndex = highestZIndex + 1;
    const newNote = {
      content: "New note",
      position: { x: 50, y: 50 },
      color: noteCreationColor,
      zIndex: newZIndex,
    };

    try {
      await addDoc(notesRef, newNote);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Delete a sticky note
  const deleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(notesRef, id));
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Add a new drawing path
  const addDrawingPath = async (path: Omit<DrawingPath, 'id'>) => {
    try {
      await addDoc(drawingPathsRef, path);
    } catch (error) {
      console.error("Error adding drawing path:", error);
    }
  };

  // Add a new shape
  const addShape = async (shape: Omit<Shape, 'id'>) => {
    try {
      await addDoc(shapesRef, shape);
    } catch (error) {
      console.error("Error adding shape:", error);
    }
  };

  // Delete drawing elements from Firebase
  const deleteDrawingElements = async (paths: string[], shapes: string[]) => {
    if (paths.length === 0 && shapes.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      
      // Add path deletions to batch
      paths.forEach(pathId => {
        const pathRef = doc(drawingPathsRef, pathId);
        batch.delete(pathRef);
      });
      
      // Add shape deletions to batch
      shapes.forEach(shapeId => {
        const shapeRef = doc(shapesRef, shapeId);
        batch.delete(shapeRef);
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error deleting drawing elements:", error);
    }
  };

  // Check if a point is near a shape
  const isPointNearShape = (point: Position, shape: Shape, threshold: number = 10) => {
    if (shape.type === "rectangle") {
      const minX = Math.min(shape.startPos.x, shape.endPos.x) - threshold;
      const maxX = Math.max(shape.startPos.x, shape.endPos.x) + threshold;
      const minY = Math.min(shape.startPos.y, shape.endPos.y) - threshold;
      const maxY = Math.max(shape.startPos.y, shape.endPos.y) + threshold;
      
      return (
        point.x >= minX && point.x <= maxX &&
        point.y >= minY && point.y <= maxY
      );
    } else if (shape.type === "circle") {
      const centerX = (shape.startPos.x + shape.endPos.x) / 2;
      const centerY = (shape.startPos.y + shape.endPos.y) / 2;
      const radius = Math.sqrt(
        (shape.endPos.x - shape.startPos.x) ** 2 + 
        (shape.endPos.y - shape.startPos.y) ** 2
      ) / 2;
      
      const distance = Math.sqrt((point.x - centerX) ** 2 + (point.y - centerY) ** 2);
      return Math.abs(distance - radius) <= threshold;
    }
    return false;
  };

  // Handle eraser selection - marks entire paths/shapes for deletion
  const handleEraserSelection = (point: Position) => {
    let found = false;

    // Check paths - mark entire path if ANY point is near
    drawingPaths.forEach(path => {
      if (path.points.some(p => 
        Math.sqrt((p.x - point.x)**2 + (p.y - point.y)**2) < 10
      )) {
        eraserSelectionRef.current.paths.add(path.id);
        found = true;
      }
    });

    // Check shapes - mark entire shape if point is near
    shapes.forEach(shape => {
      if (isPointNearShape(point, shape)) {
        eraserSelectionRef.current.shapes.add(shape.id);
        found = true;
      }
    });

    return found;
  };

  // Local state updates (not persisted to Firestore)
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

      if (selectedTool === "eraser") {
        // Reset selection sets
        eraserSelectionRef.current.paths = new Set();
        eraserSelectionRef.current.shapes = new Set();
        
        // Check initial point
        handleEraserSelection(pos);
        setIsDrawing(true);
        setCurrentPath([pos]);
        return;
      }

      if (selectedTool === "rectangle" || selectedTool === "circle") {
        const newShape: Omit<Shape, 'id'> = {
          type: selectedTool,
          startPos: pos,
          endPos: pos,
          color: drawingColor,
          strokeWidth: selectedTool === "brush" ? 4 : 2,
        };
        setCurrentShape(newShape as Shape);
        setIsDrawing(true);
      } else {
        setIsDrawing(true);
        setCurrentPath([pos]);
      }
    },
    [selectedTool, getMousePosition, drawingColor, drawingPaths, shapes],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (selectedTool === "select" || !isDrawing) return;

      const pos = getMousePosition(e);

      if (selectedTool === "eraser") {
        // Track movement for preview
        setCurrentPath(prev => [...prev, pos]);
        // Accumulate hits
        handleEraserSelection(pos);
        return;
      }

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

    if (selectedTool === "eraser") {
      // Convert Sets to arrays for deletion
      const pathsToDelete = Array.from(eraserSelectionRef.current.paths);
      const shapesToDelete = Array.from(eraserSelectionRef.current.shapes);
      
      if (pathsToDelete.length > 0 || shapesToDelete.length > 0) {
        deleteDrawingElements(pathsToDelete, shapesToDelete);
      }
    } else if (selectedTool === "rectangle" || selectedTool === "circle") {
      if (currentShape) {
        // Save shape to Firestore
        addShape({
          type: currentShape.type,
          startPos: currentShape.startPos,
          endPos: currentShape.endPos,
          color: currentShape.color,
          strokeWidth: currentShape.strokeWidth,
        });
        setCurrentShape(null);
      }
    } else if (currentPath.length > 1) {
      const strokeWidth =
        selectedTool === "brush" ? 4 : selectedTool === "eraser" ? 8 : 2;
      
      // Save path to Firestore
      addDrawingPath({
        points: currentPath,
        color: drawingColor,
        strokeWidth,
        tool: selectedTool,
      });
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

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }

      ctx.stroke();
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

  const drawEraserPreview = useCallback(
    (ctx: CanvasRenderingContext2D, point: Position) => {
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
      
      const radius = 10;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    },
    []
  );

  const drawSelectionPreview = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { paths: pathSet, shapes: shapeSet } = eraserSelectionRef.current;
      
      // Highlight selected paths
      drawingPaths.forEach(path => {
        if (pathSet.has(path.id)) {
          ctx.strokeStyle = "#FF0000";
          ctx.lineWidth = path.strokeWidth + 4;
          ctx.beginPath();
          ctx.moveTo(path.points[0].x, path.points[0].y);
          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
          }
          ctx.stroke();
        }
      });
      
      // Highlight selected shapes
      shapes.forEach(shape => {
        if (shapeSet.has(shape.id)) {
          ctx.strokeStyle = "#FF0000";
          ctx.lineWidth = shape.strokeWidth + 4;
          
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
        }
      });
    },
    [drawingPaths, shapes]
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
      selectedTool !== "circle" &&
      selectedTool !== "eraser"
    ) {
      const strokeWidth =
        selectedTool === "brush" ? 4 : selectedTool === "eraser" ? 8 : 2;
      const tempPath: DrawingPath = {
        id: "temp",
        points: currentPath,
        color: drawingColor,
        strokeWidth,
        tool: selectedTool,
      };
      drawPath(ctx, tempPath);
    }

    // Draw current shape being drawn
    if (isDrawing && currentShape) {
      drawShape(ctx, currentShape);
    }
    
    // Draw eraser preview and selection
    if (selectedTool === "eraser" && isDrawing) {
      // Draw eraser position
      if (currentPath.length > 0) {
        const lastPoint = currentPath[currentPath.length - 1];
        drawEraserPreview(ctx, lastPoint);
      }
      
      // Draw selection preview
      drawSelectionPreview(ctx);
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
    drawEraserPreview,
    drawSelectionPreview
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
        noteCreationColor={noteCreationColor}
        onNoteCreationColorChange={setNoteCreationColor}
        onColorChange={handleColorChange} // For existing notes
        handleDrawingColorChange={setDrawingColor} // For drawing tools
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