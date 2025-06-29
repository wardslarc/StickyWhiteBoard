import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  Search,
  Trash2,
  AlertTriangle,
  Filter,
} from "lucide-react";

interface FlaggedNote {
  id: string;
  content: string;
  reporter: string;
  reporterEmail: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
  whiteboard: string;
  reason: string;
}

const ContentModeration = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedNote, setSelectedNote] = useState<FlaggedNote | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Mock data for flagged notes
  const flaggedNotes: FlaggedNote[] = [
    {
      id: "1",
      content:
        "This content contains inappropriate language that violates our community guidelines.",
      reporter: "John Smith",
      reporterEmail: "john.smith@example.com",
      timestamp: "2023-06-15T14:30:00",
      severity: "high",
      whiteboard: "Project Planning",
      reason: "Inappropriate language",
    },
    {
      id: "2",
      content:
        "This sticky note contains potentially misleading information about the project timeline.",
      reporter: "Emma Johnson",
      reporterEmail: "emma.j@example.com",
      timestamp: "2023-06-14T09:15:00",
      severity: "medium",
      whiteboard: "Marketing Campaign",
      reason: "Misleading information",
    },
    {
      id: "3",
      content:
        "This note has duplicate content from another user's contribution.",
      reporter: "Michael Brown",
      reporterEmail: "mbrown@example.com",
      timestamp: "2023-06-13T16:45:00",
      severity: "low",
      whiteboard: "Brainstorming Session",
      reason: "Duplicate content",
    },
    {
      id: "4",
      content:
        "This note contains external links that may be unsafe or phishing attempts.",
      reporter: "Sarah Wilson",
      reporterEmail: "swilson@example.com",
      timestamp: "2023-06-12T11:20:00",
      severity: "high",
      whiteboard: "Team Resources",
      reason: "Suspicious links",
    },
    {
      id: "5",
      content: "This note has content that appears to be spam or advertising.",
      reporter: "David Lee",
      reporterEmail: "dlee@example.com",
      timestamp: "2023-06-11T13:50:00",
      severity: "medium",
      whiteboard: "Customer Feedback",
      reason: "Spam content",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertCircle className="h-4 w-4 mr-1" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      case "low":
        return <AlertCircle className="h-4 w-4 mr-1 opacity-70" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (note: FlaggedNote) => {
    setSelectedNote(note);
    setIsDetailOpen(true);
  };

  const handleApprove = (id: string) => {
    // Logic to approve the note would go here
    console.log(`Approved note ${id}`);
    if (isDetailOpen) setIsDetailOpen(false);
  };

  const handleDelete = (id: string) => {
    // Logic to delete the note would go here
    console.log(`Deleted note ${id}`);
    if (isDetailOpen) setIsDetailOpen(false);
  };

  const handleWarning = (id: string) => {
    // Logic to send warning would go here
    console.log(`Warning sent for note ${id}`);
    if (isDetailOpen) setIsDetailOpen(false);
  };

  // Filter notes based on search query and filters
  const filteredNotes = flaggedNotes.filter((note) => {
    const matchesSearch =
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.reporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.whiteboard.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity =
      severityFilter === "all" || note.severity === severityFilter;

    // Simple date filter for demo purposes
    let matchesDate = true;
    if (dateFilter === "today") {
      const today = new Date().toDateString();
      const noteDate = new Date(note.timestamp).toDateString();
      matchesDate = today === noteDate;
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = new Date(note.timestamp) >= weekAgo;
    }

    return matchesSearch && matchesSeverity && matchesDate;
  });

  return (
    <div className="p-6 bg-white h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content Moderation</h1>
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground mt-2 mr-2">
            {filteredNotes.length} items requiring review
          </span>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button size="sm">Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <Input
            placeholder="Search by content, reporter, or whiteboard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Past Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Flagged Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Whiteboard</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {note.content}
                    </TableCell>
                    <TableCell>{note.reporter}</TableCell>
                    <TableCell>{note.whiteboard}</TableCell>
                    <TableCell>{formatDate(note.timestamp)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getSeverityColor(note.severity) as any}
                        className="flex items-center w-fit"
                      >
                        {getSeverityIcon(note.severity)}
                        {note.severity.charAt(0).toUpperCase() +
                          note.severity.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(note)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleApprove(note.id)}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(note.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No flagged content matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Flagged Content Details</DialogTitle>
            <DialogDescription>
              Review the details of this flagged content and take appropriate
              action.
            </DialogDescription>
          </DialogHeader>

          {selectedNote && (
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="reporter">Reporter</TabsTrigger>
                <TabsTrigger value="context">Context</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 mt-4">
                <div className="border rounded-md p-4 bg-slate-50">
                  <p className="whitespace-pre-wrap">{selectedNote.content}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Reason for Flag</h4>
                  <p>{selectedNote.reason}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Severity</h4>
                  <Badge
                    variant={getSeverityColor(selectedNote.severity) as any}
                    className="flex items-center w-fit"
                  >
                    {getSeverityIcon(selectedNote.severity)}
                    {selectedNote.severity.charAt(0).toUpperCase() +
                      selectedNote.severity.slice(1)}
                  </Badge>
                </div>
              </TabsContent>

              <TabsContent value="reporter" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Reporter Name</h4>
                    <p>{selectedNote.reporter}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Reporter Email</h4>
                    <p>{selectedNote.reporterEmail}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Report Date</h4>
                    <p>{formatDate(selectedNote.timestamp)}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="context" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Whiteboard</h4>
                    <p>{selectedNote.whiteboard}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Note ID</h4>
                    <p className="font-mono text-sm">{selectedNote.id}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => selectedNote && handleWarning(selectedNote.id)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Send Warning
              </Button>
              <Button
                variant="outline"
                onClick={() => selectedNote && handleDelete(selectedNote.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button
                onClick={() => selectedNote && handleApprove(selectedNote.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentModeration;
