import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, ChevronRight } from "lucide-react";
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
}

interface CreateBoardDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateBoardDialog = ({
  open = false,
  onOpenChange = () => {},
}: CreateBoardDialogProps) => {
  const [boardName, setBoardName] = useState("Untitled Board");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [step, setStep] = useState<"name" | "template">("name");
  const [loading, setLoading] = useState(false);

  const templates: Template[] = [
    {
      id: "blank",
      name: "Blank Board",
      description: "Start with a clean canvas",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
    },
    {
      id: "brainstorm",
      name: "Brainstorming",
      description: "Ideation and creative thinking",
      thumbnail: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
    },
    {
      id: "kanban",
      name: "Kanban Board",
      description: "Task management workflow",
      thumbnail: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80",
    },
    {
      id: "mindmap",
      name: "Mind Map",
      description: "Visual thinking and connections",
      thumbnail: "https://images.unsplash.com/photo-1557682257-2f9c37a3a5f3?w=400&q=80",
    },
  ];

  const handleNext = () => {
    if (step === "name") {
      if (!boardName.trim()) {
        alert("Please enter a board name.");
        return;
      }
      setStep("template");
    } else {
      if (!selectedTemplate) {
        alert("Please select a template.");
        return;
      }
      handleCreateBoard();
    }
  };

  const handleBack = () => setStep("name");

  const handleCreateBoard = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to create a board.");
      return;
    }

    console.log("Creating board for user:", user.uid);
    setLoading(true);
    try {
      const selected = templates.find((t) => t.id === selectedTemplate) || templates[0];

      await addDoc(collection(db, "boards"), {
        title: boardName,
        templateId: selected.id,
        templateName: selected.name,
        thumbnail: selected.thumbnail,
        createdAt: serverTimestamp(),
        lastEdited: serverTimestamp(),
        userId: user.uid,
      });

      console.log("Board created successfully.");
      resetDialog();
    } catch (error) {
      console.error("Failed to create board:", error);
      alert("Failed to create board. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setBoardName("Untitled Board");
    setSelectedTemplate(null);
    setStep("name");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create New Board
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {step === "name" ? "Create New Board" : "Choose a Template"}
          </DialogTitle>
          <DialogDescription>
            {step === "name"
              ? "Give your board a name to get started."
              : "Select a template or start with a blank board."}
          </DialogDescription>
        </DialogHeader>

        {step === "name" ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-4 max-h-[400px] overflow-y-auto">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all ${
                  selectedTemplate === template.id ? "ring-2 ring-primary" : "hover:bg-accent"
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {template.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DialogFooter>
          {step === "template" && (
            <Button variant="outline" onClick={handleBack} className="mr-auto">
              Back
            </Button>
          )}
          <Button onClick={handleNext} disabled={loading}>
            {loading ? (
              "Creating..."
            ) : step === "name" ? (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Create Board"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBoardDialog;
