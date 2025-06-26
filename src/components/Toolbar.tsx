import React, { useState } from "react";
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
}

const Toolbar = ({
  onAddNote = () => {},
  onColorChange = () => {},
  onDelete = () => {},
  onIncreaseSize = () => {},
  onDecreaseSize = () => {},
  selectedNoteId = null,
  selectedTool = "select",
  onToolChange = () => {},
  drawingColor = "#000000",
  onDrawingColorChange = () => {},
}: ToolbarProps) => {
  const [selectedColor, setSelectedColor] = useState("#FFEB3B"); // Default yellow

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

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onColorChange(color);
  };

  const handleDrawingColorSelect = (color: string) => {
    onDrawingColorChange(color);
  };

  const handleToolSelect = (tool: DrawingTool) => {
    onToolChange(tool);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border-b shadow-sm w-full">
      <div className="flex items-center space-x-3">
        {/* Drawing Tools */}
        <div className="flex items-center space-x-1">
          {drawingTools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <TooltipProvider key={tool.value}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        selectedTool === tool.value ? "default" : "outline"
                      }
                      size="icon"
                      onClick={() => handleToolSelect(tool.value)}
                      className={
                        selectedTool === tool.value
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                      }
                    >
                      <IconComponent className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tool.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Drawing Color Picker */}
        {selectedTool !== "select" && selectedTool !== "eraser" && (
          <Popover>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="hover:bg-gray-100"
                      style={{ borderBottom: `3px solid ${drawingColor}` }}
                    >
                      <Palette className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
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
                    onClick={() => handleDrawingColorSelect(color.value)}
                    aria-label={`Select ${color.name}`}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Add Note Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onAddNote}
                className="hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add sticky note</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Note Color Picker */}
        <Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!selectedNoteId}
                    className="hover:bg-gray-100 disabled:opacity-50"
                    style={{
                      borderBottom: selectedNoteId
                        ? `3px solid ${selectedColor}`
                        : undefined,
                    }}
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>
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
                  onClick={() => handleColorSelect(color.value)}
                  aria-label={`Select ${color.name}`}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Note Size Controls */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={!selectedNoteId}
                onClick={onIncreaseSize}
                className="hover:bg-gray-100 disabled:opacity-50"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
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
                className="hover:bg-gray-100 disabled:opacity-50"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Decrease size</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Delete Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={!selectedNoteId}
                onClick={onDelete}
                className="hover:bg-red-100 text-red-500 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete note</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="text-sm font-medium text-gray-500">
        {selectedTool === "select"
          ? selectedNoteId
            ? "Note selected - Use tools to modify"
            : "Select a tool or click a note"
          : `${selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} tool active`}
      </div>
    </div>
  );
};

export default Toolbar;
