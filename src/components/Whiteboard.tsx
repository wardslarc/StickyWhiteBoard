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
  updateDoc,
  serverTimestamp,
  arrayUnion
} from "../firebase";
import { getDatabase, ref, set, onDisconnect, onValue, off, update, remove } from "firebase/database";
import { DrawingPath, Shape, Note, Position, Board } from "./whiteboardTypes";
import { getAuth } from "firebase/auth";
import { useParams, useNavigate } from "react-router-dom";

const Whiteboard = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const [board, setBoard] = useState<Board | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notePositions, setNotePositions] = useState<Record<string, Position>>({});
  const [highestZIndex, setHighestZIndex] = useState<number>(0);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<DrawingTool>("select");
  const [drawingColor, setDrawingColor] = useState<string>("#000000");
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<Position[]>([]);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [activeViewers, setActiveViewers] = useState(0);
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [noteCreationColor, setNoteCreationColor] = useState<string>("#ffcc80");
  const [collaborators, setCollaborators] = useState<{id: string, name: string, color: string}[]>([]);
  const [cursors, setCursors] = useState<{[key: string]: Position}>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [showCollaboratorsList, setShowCollaboratorsList] = useState(false);
  const rtdb = getDatabase();
  
  const eraserSelectionRef = useRef<{ 
    paths: Set<string>; 
    shapes: Set<string> 
  }>({ 
    paths: new Set(), 
    shapes: new Set() 
  });

  // Generate a consistent color from user ID
  const getUserColor = (id: string) => {
    const hue = parseInt(id.slice(-3), 16) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  // Initialize user and board data
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        setUserId(user.uid);
        setUserName(user.displayName || `User${user.uid.slice(0, 5)}`);
        
        if (boardId) {
          try {
            const boardRef = doc(db, "boards", boardId);
            const boardSnap = await getDoc(boardRef);
            
            if (boardSnap.exists()) {
              setBoard({
                ...boardSnap.data() as Board,
                id: boardSnap.id,
                lastEdited: (boardSnap.data() as Board).lastEdited || Timestamp.now()
              });
              setShareLink(`${window.location.origin}/board/${boardId}`);
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
    set(presenceRef, {
      userId,
      name: userName,
      lastActive: Date.now()
    });
    
    onDisconnect(presenceRef).remove();
    
    const collaboratorsRef = ref(rtdb, `presence/${boardId}`);
    const unsubscribeCollaborators = onValue(collaboratorsRef, (snapshot) => {
      const users = snapshot.val() || {};
      setActiveViewers(Object.keys(users).length);
      
      const collaboratorsData = Object.entries(users).map(([id, userData]: [string, any]) => ({
        id: userData.userId,
        name: userData.name,
        color: getUserColor(userData.userId)
      })).filter(user => user.id !== userId);
      
      setCollaborators(collaboratorsData);
    });
    
    return () => {
      remove(presenceRef);
      off(collaboratorsRef);
    };
  }, [boardId, userId, rtdb, userName]);

  // Setup cursor tracking
  useEffect(() => {
    if (!boardId || !userId || !whiteboardRef.current) return;
    
    const cursorRef = ref(rtdb, `cursors/${boardId}/${userId}`);
    const handleMouseMove = (e: MouseEvent) => {
      if (!whiteboardRef.current) return;
      const rect = whiteboardRef.current.getBoundingClientRect();
      update(cursorRef, {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    const cursorsRef = ref(rtdb, `cursors/${boardId}`);
    const unsubscribeCursors = onValue(cursorsRef, (snapshot) => {
      setCursors(snapshot.val() || {});
    });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      remove(cursorRef);
      off(cursorsRef);
    };
  }, [boardId, userId, rtdb]);

  // Real-time position updates for sticky notes
  const updateNotePosition = useCallback((id: string, newPos: Position) => {
    // Update local state immediately
    setNotePositions(prev => ({ ...prev, [id]: newPos }));
    
    // Update Realtime DB for instant sync
    const positionRef = ref(rtdb, `notePositions/${boardId}/${id}`);
    update(positionRef, {
      x: newPos.x,
      y: newPos.y,
      updatedBy: userId,
      timestamp: Date.now()
    });

    // Update Firestore for persistence
    updateDoc(doc(db, "notes", id), {
      position: newPos,
      updatedAt: serverTimestamp(),
      lastUpdatedBy: userId
    }).catch(console.error);
  }, [userId, boardId, rtdb]);

  // Listen for real-time position changes
  useEffect(() => {
    if (!boardId) return;
    
    const positionsRef = ref(rtdb, `notePositions/${boardId}`);
    const unsubscribe = onValue(positionsRef, (snapshot) => {
      const positions = snapshot.val() || {};
      setNotePositions(prev => {
        const newPositions = {...prev};
        Object.entries(positions).forEach(([id, posData]: [string, any]) => {
          // Only update if we're not the ones moving this note
          if (posData.updatedBy !== userId) {
            newPositions[id] = { x: posData.x, y: posData.y };
          }
        });
        return newPositions;
      });
    });
    
    return () => off(positionsRef);
  }, [boardId, userId, rtdb]);

  // Load notes with initial positions
  useEffect(() => {
    if (!boardId) return;

    const notesUnsubscribe = onSnapshot(
      query(collection(db, "notes"), where("boardId", "==", boardId)), 
      (snapshot) => {
        const notesData: Note[] = [];
        const initialPositions: Record<string, Position> = {};
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const serverPosition = data.position || { x: 50, y: 50 };
          initialPositions[doc.id] = serverPosition;

          notesData.push({
            id: doc.id,
            content: data.content,
            position: serverPosition,
            color: data.color,
            zIndex: data.zIndex || 0,
            boardId: boardId
          });
        });

        setNotes(notesData);
        setNotePositions(prev => ({ ...prev, ...initialPositions }));

        if (notesData.length > 0) {
          setHighestZIndex(Math.max(...notesData.map(note => note.zIndex)));
        }
      }
    );

    return notesUnsubscribe;
  }, [boardId]);

  // Load drawing paths
  useEffect(() => {
    if (!boardId) return;
    
    const pathsUnsubscribe = onSnapshot(
      query(collection(db, "drawingPaths"), where("boardId", "==", boardId)),
      (snapshot) => {
        const pathsData: DrawingPath[] = [];
        snapshot.forEach((doc) => {
          pathsData.push({
            ...doc.data() as DrawingPath,
            id: doc.id
          });
        });
        setDrawingPaths(pathsData);
      }
    );
    
    return pathsUnsubscribe;
  }, [boardId]);

  // Load shapes
  useEffect(() => {
    if (!boardId) return;
    
    const shapesUnsubscribe = onSnapshot(
      query(collection(db, "shapes"), where("boardId", "==", boardId)),
      (snapshot) => {
        const shapesData: Shape[] = [];
        snapshot.forEach((doc) => {
          shapesData.push({
            ...doc.data() as Shape,
            id: doc.id
          });
        });
        setShapes(shapesData);
      }
    );
    
    return shapesUnsubscribe;
  }, [boardId]);

  // Cleanup realtime positions when unmounting
  useEffect(() => {
    return () => {
      if (boardId && userId) {
        const positionsRef = ref(rtdb, `notePositions/${boardId}/${userId}`);
        remove(positionsRef).catch(console.error);
      }
    };
  }, [boardId, userId, rtdb]);

  // Merge notes with their current positions
  const mergedNotes = notes.map(note => ({
    ...note,
    position: notePositions[note.id] || note.position
  }));

  // Add a new sticky note
  const addNote = async () => {
    if (!boardId) return;
    
    const newZIndex = highestZIndex + 1;
    const initialPosition = { x: 50, y: 50 };
    
    try {
      const newNoteRef = await addDoc(collection(db, "notes"), {
        content: "New note",
        position: initialPosition,
        color: noteCreationColor,
        zIndex: newZIndex,
        boardId: boardId,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: userId
      });
      
      // Initialize realtime position
      const positionRef = ref(rtdb, `notePositions/${boardId}/${newNoteRef.id}`);
      set(positionRef, {
        x: initialPosition.x,
        y: initialPosition.y,
        updatedBy: userId,
        timestamp: Date.now()
      });
      
      // Update local state
      setNotePositions(prev => ({ ...prev, [newNoteRef.id]: initialPosition }));
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Delete a sticky note
  const deleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notes", id));
      // Remove from realtime positions
      const positionRef = ref(rtdb, `notePositions/${boardId}/${id}`);
      remove(positionRef).catch(console.error);
      
      // Update local state
      setNotePositions(prev => {
        const newPositions = {...prev};
        delete newPositions[id];
        return newPositions;
      });
      
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Bring note to front
  const bringToFront = async (id: string) => {
    const newZIndex = highestZIndex + 1;
    try {
      await updateDoc(doc(db, "notes", id), {
        zIndex: newZIndex,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: userId
      });
      setHighestZIndex(newZIndex);
    } catch (error) {
      console.error("Error bringing note to front:", error);
    }
  };

  // Update note content
  const updateNoteContent = async (id: string, content: string) => {
    try {
      await updateDoc(doc(db, "notes", id), {
        content,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: userId
      });
    } catch (error) {
      console.error("Error updating note content:", error);
    }
  };

  // Update note color
  const updateNoteColor = async (id: string, color: string) => {
    try {
      await updateDoc(doc(db, "notes", id), {
        color,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: userId
      });
    } catch (error) {
      console.error("Error updating note color:", error);
    }
  };

  // Handle color change from toolbar
  const handleColorChange = (color: string) => {
    if (selectedNoteId) {
      updateNoteColor(selectedNoteId, color);
    }
  };

  // Handle delete from toolbar
  const handleDelete = () => {
    if (selectedNoteId) {
      deleteNote(selectedNoteId);
    }
  };

  // Handle increase size from toolbar
  const handleIncreaseSize = () => {
    console.log("Increase size functionality");
  };

  // Handle decrease size from toolbar
  const handleDecreaseSize = () => {
    console.log("Decrease size functionality");
  };

  // Handle save and exit
  const handleSaveAndExit = async () => {
    try {
      if (boardId) {
        await updateDoc(doc(db, "boards", boardId), {
          lastEdited: Timestamp.now()
        });
      }
    } catch (error) {
      console.error("Error saving board:", error);
    }
    navigate("/board");
  };

  // Share board with another user
  const handleShareBoard = async () => {
    if (!boardId || !shareEmail) return;
    
    setIsSharing(true);
    try {
      await updateDoc(doc(db, "boards", boardId), {
        sharedWith: arrayUnion(shareEmail)
      });
      setShareEmail("");
      setShowShareModal(false);
    } catch (error) {
      console.error("Error sharing board:", error);
    } finally {
      setIsSharing(false);
    }
  };

  // Drawing functions
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

  const deleteDrawingElements = async (paths: string[], shapes: string[]) => {
    if (paths.length === 0 && shapes.length === 0) return;
    try {
      const batch = writeBatch(db);
      paths.forEach(pathId => batch.delete(doc(db, "drawingPaths", pathId)));
      shapes.forEach(shapeId => batch.delete(doc(db, "shapes", shapeId)));
      await batch.commit();
    } catch (error) {
      console.error("Error deleting drawing elements:", error);
    }
  };

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
        Math.pow(shape.endPos.x - shape.startPos.x, 2) + 
        Math.pow(shape.endPos.y - shape.startPos.y, 2)
      ) / 2;
      
      const distance = Math.sqrt(Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2));
      return Math.abs(distance - radius) <= threshold;
    }
    return false;
  };

  const handleEraserSelection = (point: Position) => {
    let found = false;

    drawingPaths.forEach(path => {
      if (path.points.some(p => 
        Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)) < 10
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
        setCurrentShape({
          type: selectedTool,
          startPos: pos,
          endPos: pos,
          color: drawingColor,
          strokeWidth: selectedTool === "brush" ? 4 : 2,
        });
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

  const drawCollaboratorCursors = (ctx: CanvasRenderingContext2D) => {
    Object.entries(cursors).forEach(([collaboratorId, position]) => {
      if (collaboratorId === userId) return;
      
      const collaborator = collaborators.find(c => c.id === collaboratorId);
      if (!collaborator) return;
      
      ctx.shadowColor = collaborator.color;
      ctx.shadowBlur = 15;
      ctx.fillStyle = collaborator.color;
      ctx.beginPath();
      ctx.arc(position.x, position.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(position.x, position.y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(position.x, position.y - 15);
      ctx.lineTo(position.x, position.y + 15);
      ctx.moveTo(position.x - 15, position.y);
      ctx.lineTo(position.x + 15, position.y);
      ctx.stroke();
      
      ctx.font = "bold 12px sans-serif";
      const textWidth = ctx.measureText(collaborator.name).width;
      const tagPadding = 8;
      const tagHeight = 20;
      const tagY = position.y - 35;
      
      ctx.fillStyle = collaborator.color;
      const tagX = position.x - textWidth/2 - tagPadding;
      ctx.beginPath();
      ctx.roundRect(tagX, tagY, textWidth + tagPadding*2, tagHeight, 10);
      ctx.fill();
      
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(collaborator.name, position.x, tagY + tagHeight/2);
      
      ctx.strokeStyle = collaborator.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(position.x, position.y - 8);
      ctx.lineTo(position.x, tagY + tagHeight);
      ctx.stroke();
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

    if (isDrawing) {
      if (currentPath.length > 1 && 
          selectedTool !== "rectangle" && 
          selectedTool !== "circle" && 
          selectedTool !== "eraser") {
        const tempPath: DrawingPath = {
          id: "temp",
          points: currentPath,
          color: drawingColor,
          strokeWidth: selectedTool === "brush" ? 4 : 2,
          tool: selectedTool,
        };
        drawPath(ctx, tempPath);
      }

      if (currentShape) {
        drawShape(ctx, currentShape);
      }
      
      if (selectedTool === "eraser") {
        if (currentPath.length > 0) {
          drawEraserPreview(ctx, currentPath[currentPath.length - 1]);
        }
        drawSelectionPreview(ctx);
      }
    }
    
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

  return (
    <div className="flex flex-col h-full w-full bg-gray-100">
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
            
            {/* Enhanced User Presence Display */}
            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="bg-white text-indigo-700 font-semibold py-2 px-4 rounded-full shadow hover:bg-indigo-50 transition-colors duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share
                </button>
                
                <button
                  onClick={handleSaveAndExit}
                  className="bg-white text-indigo-700 font-semibold py-2 px-4 rounded-full shadow hover:bg-indigo-50 transition-colors duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Save & Exit
                </button>
              </div>
              
              {/* Active Users Section */}
              <div className="mt-3 flex items-center">
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium">
                    {activeViewers} {activeViewers === 1 ? 'person' : 'people'} online
                  </span>
                </div>
                
                <div className="flex -space-x-2">
                  {/* Current User */}
                  <div 
                    className="relative bg-white text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white hover:z-10 hover:scale-110 transition-transform duration-200"
                    title={`You (${userName})`}
                  >
                    <span className="font-bold text-sm">
                      {userName[0].toUpperCase()}
                    </span>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  {/* Collaborators */}
                  {collaborators.slice(0, 4).map((collaborator) => (
                    <div 
                      key={collaborator.id}
                      className="relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-white hover:z-10 hover:scale-110 transition-transform duration-200"
                      style={{ backgroundColor: collaborator.color }}
                      title={collaborator.name}
                    >
                      <span className="font-bold text-sm text-white">
                        {collaborator.name[0].toUpperCase()}
                      </span>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                  ))}
                  
                  {/* More collaborators indicator */}
                  {collaborators.length > 4 && (
                    <div 
                      className="relative bg-indigo-800 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white hover:z-10 hover:scale-110 transition-transform duration-200 cursor-pointer"
                      onClick={() => setShowCollaboratorsList(!showCollaboratorsList)}
                      title={`${collaborators.length - 4} more collaborators`}
                    >
                      +{collaborators.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Collaborators List Dropdown */}
          {showCollaboratorsList && collaborators.length > 4 && (
            <div className="absolute right-4 mt-2 z-50 w-56 bg-white rounded-md shadow-lg py-1">
              <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                Active Collaborators ({collaborators.length + 1})
              </div>
              <div className="max-h-60 overflow-y-auto">
                <div className="px-4 py-2 text-sm text-gray-700 flex items-center">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-2">
                    {userName[0].toUpperCase()}
                  </div>
                  You (Owner)
                </div>
                
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="px-4 py-2 text-sm text-gray-700 flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center mr-2 text-white"
                      style={{ backgroundColor: collaborator.color }}
                    >
                      {collaborator.name[0].toUpperCase()}
                    </div>
                    {collaborator.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Share this board</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invite by email
              </label>
              <div className="flex">
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={handleShareBoard}
                  disabled={isSharing || !shareEmail}
                  className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSharing ? "Sending..." : "Invite"}
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Or share this link
              </label>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              Anyone with the link can view and edit this board.
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
            onToolChange={setSelectedTool}
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
          {mergedNotes.map((note) => (
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
              onSelect={() => {
                setSelectedNoteId(note.id);
                bringToFront(note.id);
              }}
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