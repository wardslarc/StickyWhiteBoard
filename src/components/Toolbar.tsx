import React from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Plus,
  Palette,
  Trash2,
  Maximize2,
  Minimize2,
  Pen,
  MousePointer,
  Brush,
  Eraser,
  Square,
  Circle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export type DrawingTool =
  | "select"
  | "pen"
  | "brush"
  | "eraser"
  | "rectangle"
  | "circle";

interface ToolbarProps {
  onAddNote: () => void;
  onColorChange: (color: string) => void;
  onDelete: () => void;
  onIncreaseSize: () => void;
  onDecreaseSize: () => void;
  selectedNoteId: string | null;
  selectedTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  drawingColor: string;
  onDrawingColorChange: (color: string) => void;
  noteCreationColor: string;
  onNoteCreationColorChange: (color: string) => void;
}

const Toolbar = ({
  onAddNote,
  onColorChange,
  onDelete,
  onIncreaseSize,
  onDecreaseSize,
  selectedNoteId,
  selectedTool,
  onToolChange,
  drawingColor,
  onDrawingColorChange,
  noteCreationColor,
  onNoteCreationColorChange,
}: ToolbarProps) => {
  const colors = [
    { name: "Yellow", value: "#FFEB3B" },
    { name: "Green", value: "#CDDC39" },
    { name: "Blue", value: "#03A9F4" },
    { name: "Pink", value: "#E91E63" },
    { name: "Purple", value: "#9C27B0" },
    { name: "Orange", value: "#FF9800" },
  ];

  const drawingColors = [
    { name: "Black", value: "#000000" },
    { name: "Red", value: "#FF0000" },
    { name: "Blue", value: "#0000FF" },
    { name: "Green", value: "#00FF00" },
    { name: "Purple", value: "#800080" },
    { name: "Orange", value: "#FFA500" },
  ];

  const drawingTools = [
    { name: "Select", value: "select" as DrawingTool, icon: MousePointer },
    { name: "Pen", value: "pen" as DrawingTool, icon: Pen },
    { name: "Brush", value: "brush" as DrawingTool, icon: Brush },
    { name: "Eraser", value: "eraser" as DrawingTool, icon: Eraser },
    { name: "Rectangle", value: "rectangle" as DrawingTool, icon: Square },
    { name: "Circle", value: "circle" as DrawingTool, icon: Circle },
  ];

  const handleToolSelect = (tool: DrawingTool) => {
    onToolChange(tool);
  };

  return (
    <div className="flex flex-col items-center p-3 bg-white border-r shadow-sm h-full w-20 space-y-3">
      {drawingTools.map((tool) => {
        const IconComponent = tool.icon;
        const isActive = selectedTool === tool.value;
        return (
          <TooltipProvider key={tool.value}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleToolSelect(tool.value)}
                  className={`w-12 h-12 ${
                    isActive
                      ? "border-l-4 border-blue-500 bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <IconComponent
                    className={`h-4 w-4 ${
                      isActive ? "text-blue-600" : "text-gray-700"
                    }`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{tool.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}

      <div className="w-8 h-px bg-gray-300" />

      {selectedTool !== "select" && selectedTool !== "eraser" && (
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-12 h-12 border-l-4"
                    style={{ borderColor: drawingColor }}
                  >
                    <Palette className="h-4 w-4 text-gray-700" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Drawing color</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PopoverContent className="w-48">
            <div className="grid grid-cols-3 gap-2">
              {drawingColors.map((color) => (
                <button
                  key={color.value}
                  className="w-10 h-10 rounded-md border border-gray-200 transition-transform hover:scale-105"
                  style={{ backgroundColor: color.value }}
                  onClick={() => onDrawingColorChange(color.value)}
                  aria-label={`Select ${color.name}`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onAddNote}
              className="w-12 h-12 hover:bg-gray-100"
            >
              <Plus className="h-4 w-4 text-gray-700" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add sticky note</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Popover>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 border-l-4"
                  style={{ borderColor: noteCreationColor }}
                >
                  <Square className="h-4 w-4 text-gray-700" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>New note color</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <PopoverContent className="w-48">
          <div className="grid grid-cols-3 gap-2">
            {colors.map((color) => (
              <button
                key={color.value}
                className="w-10 h-10 rounded-md border border-gray-200 transition-transform hover:scale-105"
                style={{ backgroundColor: color.value }}
                onClick={() => onNoteCreationColorChange(color.value)}
                aria-label={`Select ${color.name}`}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!selectedNoteId}
                  className="w-12 h-12 disabled:opacity-50 border-l-4"
                  style={{
                    borderColor: selectedNoteId ? noteCreationColor : "transparent",
                  }}
                >
                  <Palette className="h-4 w-4 text-gray-700" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Note color</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <PopoverContent className="w-48">
          <div className="grid grid-cols-3 gap-2">
            {colors.map((color) => (
              <button
                key={color.value}
                className="w-10 h-10 rounded-md border border-gray-200 transition-transform hover:scale-105"
                style={{ backgroundColor: color.value }}
                onClick={() => onColorChange(color.value)}
                aria-label={`Select ${color.name}`}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={!selectedNoteId}
              onClick={onIncreaseSize}
              className="w-12 h-12 disabled:opacity-50 hover:bg-gray-100"
            >
              <Maximize2 className="h-4 w-4 text-gray-700" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Increase size</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={!selectedNoteId}
              onClick={onDecreaseSize}
              className="w-12 h-12 disabled:opacity-50 hover:bg-gray-100"
            >
              <Minimize2 className="h-4 w-4 text-gray-700" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Decrease size</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={!selectedNoteId}
              onClick={onDelete}
              className="w-12 h-12 hover:bg-red-100 text-red-500 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Delete note</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default Toolbar;
