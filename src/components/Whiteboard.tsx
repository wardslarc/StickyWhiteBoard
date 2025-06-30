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
  getDoc,
  writeBatch,
  query,
  where,
  Timestamp,
  updateDoc
} from "../firebase";
import { getDatabase, ref, set, onDisconnect, onValue, off, update, remove } from "firebase/database";
import { DrawingPath, Shape, Note, Position, Board } from "./whiteboardTypes";
import { getAuth } from "firebase/auth";
import { useParams, useNavigate } from "react-router-dom";

const Whiteboard = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
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
  const [collaborators, setCollaborators] = useState<{id: string, name: string}[]>([]);
  const [cursors, setCursors] = useState<{[key: string]: Position}>({});
  const rtdb = getDatabase();
  
  const eraserSelectionRef = useRef<{ 
    paths: Set<string>; 
    shapes: Set<string> 
  }>({ 
    paths: new Set(), 
    shapes: new Set() 
  });

  // Get current user and board data
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        setUserId(user.uid);
        
        // Fetch board data
        if (boardId) {
          try {
            const boardRef = doc(db, "boards", boardId);
            const boardSnap = await getDoc(boardRef);
            
            if (boardSnap.exists()) {
              const boardData = boardSnap.data() as Board;
              setBoard({
                ...boardData,
                id: boardSnap.id,
                lastEdited: boardData.lastEdited || Timestamp.now()
              });
            } else {
              console.error("Board not found");
            }
          } catch (error) {
            console.error("Error loading board:", error);
          }
        }
      } else {
        setUserId(null);
      }
    });
    return unsubscribe;
  }, [boardId]);

  // Setup presence tracking
  useEffect(() => {
    if (!boardId || !userId) return;
    
    const presenceRef = ref(rtdb, `presence/${boardId}/${userId}`);
    
    // Set presence when user connects
    set(presenceRef, {
      userId,
      name: `User${userId.slice(0, 5)}`,
      lastActive: Date.now()
    });
    
    // Remove presence when user disconnects
    onDisconnect(presenceRef).remove();
    
    // Listen for other collaborators' presence
    const collaboratorsRef = ref(rtdb, `presence/${boardId}`);
    const unsubscribeCollaborators = onValue(collaboratorsRef, (snapshot) => {
      const users = snapshot.val();
      if (!users) {
        setCollaborators([]);
        return;
      }
      
      const activeUsers = Object.values(users)
        .filter((user: any) => user.userId !== userId)
        .map((user: any) => ({
          id: user.userId,
          name: user.name
        }));
      
      setCollaborators(activeUsers);
    });
    
    // Cleanup on unmount
    return () => {
      remove(presenceRef);
      off(collaboratorsRef);
    };
  }, [boardId, userId, rtdb]);

  // Setup cursor tracking
  useEffect(() => {
    if (!boardId || !userId || !whiteboardRef.current) return;
    
    const cursorRef = ref(rtdb, `cursors/${boardId}/${userId}`);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!whiteboardRef.current) return;
      
      const rect = whiteboardRef.current.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      update(cursorRef, position);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    // Listen for other collaborators' cursors
    const cursorsRef = ref(rtdb, `cursors/${boardId}`);
    const unsubscribeCursors = onValue(cursorsRef, (snapshot) => {
      const cursorData = snapshot.val();
      setCursors(cursorData || {});
    });
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      remove(cursorRef);
      off(cursorsRef);
    };
  }, [boardId, userId, rtdb]);

  // Firebase collection references with board ID
  const getNotesRef = () => query(
    collection(db, "notes"), 
    where("boardId", "==", boardId)
  );
  
  const getDrawingPathsRef = () => query(
    collection(db, "drawingPaths"), 
    where("boardId", "==", boardId)
  );
  
  const getShapesRef = () => query(
    collection(db, "shapes"), 
    where("boardId", "==", boardId)
  );

  // Load all whiteboard data from Firestore
  useEffect(() => {
    if (!boardId) return;

    // Load notes
    const notesUnsubscribe = onSnapshot(getNotesRef(), (snapshot) => {
      const notesData: Note[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notesData.push({
          id: doc.id,
          content: data.content,
          position: data.position,
          color: data.color,
          zIndex: data.zIndex,
          boardId: boardId
        });
      });
      setNotes(notesData);
      
      if (notesData.length > 0) {
        const maxZIndex = Math.max(...notesData.map(note => note.zIndex));
        setHighestZIndex(maxZIndex);
      } else {
        setHighestZIndex(0);
      }
    });

    // Load drawing paths
    const pathsUnsubscribe = onSnapshot(getDrawingPathsRef(), (snapshot) => {
      const pathsData: DrawingPath[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        pathsData.push({
          id: doc.id,
          points: data.points,
          color: data.color,
          strokeWidth: data.strokeWidth,
          tool: data.tool,
          boardId: boardId
        });
      });
      setDrawingPaths(pathsData);
    });

    // Load shapes
    const shapesUnsubscribe = onSnapshot(getShapesRef(), (snapshot) => {
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
          boardId: boardId
        });
      });
      setShapes(shapesData);
    });

    return () => {
      notesUnsubscribe();
      pathsUnsubscribe();
      shapesUnsubscribe();
    };
  }, [boardId]);

  // Update board lastEdited timestamp when changes occur
  useEffect(() => {
    if (!boardId || !board) return;
    
    const updateBoardTimestamp = async () => {
      try {
        const boardRef = doc(db, "boards", boardId);
        await updateDoc(boardRef, {
          lastEdited: Timestamp.now()
        });
        // Update local state to reflect new timestamp
        setBoard(prev => prev ? {
          ...prev,
          lastEdited: Timestamp.now()
        } : null);
      } catch (error) {
        console.error("Error updating board timestamp:", error);
      }
    };
    
    updateBoardTimestamp();
  }, [notes, drawingPaths, shapes, boardId, board]);

  // Add a new sticky note
  const addNote = async () => {
    if (!boardId) return;
    
    const newZIndex = highestZIndex + 1;
    const newNote = {
      content: "New note",
      position: { x: 50, y: 50 },
      color: noteCreationColor,
      zIndex: newZIndex,
      boardId: boardId
    };

    try {
      await addDoc(collection(db, "notes"), newNote);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Delete a sticky note
  const deleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notes", id));
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Add a new drawing path
  const addDrawingPath = async (path: Omit<DrawingPath, 'id'>) => {
    if (!boardId) return;
    
    try {
      await addDoc(collection(db, "drawingPaths"), {
        ...path,
        boardId: boardId
      });
    } catch (error) {
      console.error("Error adding drawing path:", error);
    }
  };

  // Add a new shape
  const addShape = async (shape: Omit<Shape, 'id'>) => {
    if (!boardId) return;
    
    try {
      await addDoc(collection(db, "shapes"), {
        ...shape,
        boardId: boardId
      });
    } catch (error) {
      console.error("Error adding shape:", error);
    }
  };

  // Delete drawing elements from Firebase
  const deleteDrawingElements = async (paths: string[], shapes: string[]) => {
    if (paths.length === 0 && shapes.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      
      paths.forEach(pathId => {
        const pathRef = doc(db, "drawingPaths", pathId);
        batch.delete(pathRef);
      });
      
      shapes.forEach(shapeId => {
        const shapeRef = doc(db, "shapes", shapeId);
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

  // Handle eraser selection
  const handleEraserSelection = (point: Position) => {
    let found = false;

    drawingPaths.forEach(path => {
      if (path.points.some(p => 
        Math.sqrt((p.x - point.x)**2 + (p.y - point.y)**2) < 10
      )) {
        eraserSelectionRef.current.paths.add(path.id);
        found = true;
      }
    });

    shapes.forEach(shape => {
      if (isPointNearShape(point, shape)) {
        eraserSelectionRef.current.shapes.add(shape.id);
        found = true;
      }
    });

    return found;
  };

  // Local state updates
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
        eraserSelectionRef.current.paths = new Set();
        eraserSelectionRef.current.shapes = new Set();
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
        setCurrentPath(prev => [...prev, pos]);
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
      const pathsToDelete = Array.from(eraserSelectionRef.current.paths);
      const shapesToDelete = Array.from(eraserSelectionRef.current.shapes);
      
      if (pathsToDelete.length > 0 || shapesToDelete.length > 0) {
        deleteDrawingElements(pathsToDelete, shapesToDelete);
      }
    } else if (selectedTool === "rectangle" || selectedTool === "circle") {
      if (currentShape) {
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

  // Draw collaborator cursors
  const drawCollaboratorCursors = (ctx: CanvasRenderingContext2D) => {
    Object.entries(cursors).forEach(([collaboratorId, position]) => {
      if (collaboratorId === userId) return;
      
      const collaborator = collaborators.find(c => c.id === collaboratorId);
      if (!collaborator) return;
      
      // Draw cursor
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(position.x, position.y, 6, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw cursor line
      ctx.beginPath();
      ctx.moveTo(position.x, position.y - 12);
      ctx.lineTo(position.x, position.y + 12);
      ctx.moveTo(position.x - 12, position.y);
      ctx.lineTo(position.x + 12, position.y);
      ctx.stroke();
      
      // Draw name tag
      ctx.fillStyle = "#3B82F6";
      ctx.font = "12px sans-serif";
      const textWidth = ctx.measureText(collaborator.name).width;
      
      ctx.fillRect(
        position.x - textWidth / 2 - 5,
        position.y - 30,
        textWidth + 10,
        20
      );
      
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(collaborator.name, position.x, position.y - 15);
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawingPaths.forEach((path) => drawPath(ctx, path));
    shapes.forEach((shape) => drawShape(ctx, shape));

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

    if (isDrawing && currentShape) {
      drawShape(ctx, currentShape);
    }
    
    if (selectedTool === "eraser" && isDrawing) {
      if (currentPath.length > 0) {
        const lastPoint = currentPath[currentPath.length - 1];
        drawEraserPreview(ctx, lastPoint);
      }
      
      drawSelectionPreview(ctx);
    }
    
    // Draw collaborator cursors
    drawCollaboratorCursors(ctx);
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
    drawSelectionPreview,
    cursors,
    collaborators,
    userId
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

  // Save and exit function
  const handleSaveAndExit = () => {
    navigate("/board"); // Navigate to board manager page
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-100">
      {/* Enhanced Board Header */}
      {board && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg p-4">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-3 md:mb-0">
              <div className="flex items-center justify-center md:justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {board.title || "Untitled Board"}
                </h1>
              </div>
              <p className="text-indigo-200 mt-1 text-sm md:text-base">
                Last edited: {board.lastEdited?.toDate().toLocaleString() || "Just now"}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Save and Exit Button */}
              <button
                onClick={handleSaveAndExit}
                className="bg-white text-indigo-700 font-semibold py-2 px-4 rounded-full shadow hover:bg-indigo-50 transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Save & Exit
              </button>
              
              <div className="flex items-center">
                {/* Collaborator Avatars */}
                <div className="flex -space-x-2 mr-4">
                  {collaborators.slice(0, 5).map((collaborator) => (
                    <div 
                      key={collaborator.id}
                      className="bg-indigo-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white"
                      title={collaborator.name}
                    >
                      <span className="font-bold text-sm">
                        {collaborator.name[0]}
                      </span>
                    </div>
                  ))}
                  {collaborators.length > 5 && (
                    <div className="bg-indigo-800 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white">
                      +{collaborators.length - 5}
                    </div>
                  )}
                </div>
                
                {/* Current User Avatar */}
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 flex items-center shadow-md">
                  <div className="bg-white text-indigo-700 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white">
                    {userId ? `U${userId.slice(0,1)}` : "U"}
                  </div>
                  <div className="ml-3 mr-4">
                    <p className="font-medium text-sm">You</p>
                    <p className="text-indigo-200 text-xs">
                      {board.userId === userId ? "Owner" : "Editor"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-row h-full w-full">
        <div className="flex flex-col h-full bg-gray-800 text-white p-3 shadow-xl w-20 items-center justify-start space-y-6">
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
            handleDrawingColorChange={setDrawingColor}
            verticalLayout={true}
          />
        </div>
        
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
    </div>
  );
};

export default Whiteboard;