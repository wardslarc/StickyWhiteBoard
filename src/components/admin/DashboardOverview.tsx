import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Activity,
  Users,
  Layout,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface DashboardOverviewProps {
  totalUsers?: number;
  activeWhiteboards?: number;
  systemStatus?: "operational" | "degraded" | "outage";
  recentActivity?: Array<{
    id: string;
    user: string;
    action: string;
    whiteboard: string;
    time: string;
  }>;
  flaggedContent?: Array<{
    id: string;
    content: string;
    reporter: string;
    severity: "low" | "medium" | "high";
    time: string;
  }>;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  totalUsers = 1245,
  activeWhiteboards = 87,
  systemStatus = "operational",
  recentActivity = [
    {
      id: "1",
      user: "John Doe",
      action: "Created whiteboard",
      whiteboard: "Project Roadmap",
      time: "5 mins ago",
    },
    {
      id: "2",
      user: "Jane Smith",
      action: "Added note",
      whiteboard: "Team Brainstorm",
      time: "12 mins ago",
    },
    {
      id: "3",
      user: "Mike Johnson",
      action: "Edited note",
      whiteboard: "Marketing Plan",
      time: "25 mins ago",
    },
    {
      id: "4",
      user: "Sarah Williams",
      action: "Deleted note",
      whiteboard: "Product Launch",
      time: "1 hour ago",
    },
    {
      id: "5",
      user: "Alex Brown",
      action: "Shared whiteboard",
      whiteboard: "Design Review",
      time: "2 hours ago",
    },
  ],
  flaggedContent = [
    {
      id: "1",
      content: "Inappropriate language in note",
      reporter: "Jane Smith",
      severity: "medium",
      time: "35 mins ago",
    },
    {
      id: "2",
      content: "Spam content added to board",
      reporter: "Mike Johnson",
      severity: "low",
      time: "1 hour ago",
    },
    {
      id: "3",
      content: "Offensive image uploaded",
      reporter: "Sarah Williams",
      severity: "high",
      time: "3 hours ago",
    },
  ],
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-500";
      case "degraded":
        return "text-amber-500";
      case "outage":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "outage":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Low
          </Badge>
        );
      case "medium":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Medium
          </Badge>
        );
      case "high":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            High
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 bg-white h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <Button className="bg-blue-600 hover:bg-blue-700">Refresh Data</Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-3xl font-bold text-gray-800">
                  {totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Whiteboards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Layout className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-3xl font-bold text-gray-800">
                  {activeWhiteboards}
                </div>
                <p className="text-xs text-green-600">+5% from last week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {getStatusIcon(systemStatus)}
              <div className="ml-3">
                <div className="text-xl font-bold capitalize">
                  <span className={getStatusColor(systemStatus)}>
                    {systemStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Last checked: 5 mins ago
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Content Tabs */}
      <Tabs defaultValue="activity" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <Activity className="h-4 w-4 mr-2" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger
            value="flagged"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Flagged Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Activity</CardTitle>
              <CardDescription>
                Latest actions across all whiteboards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Whiteboard</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">
                        {activity.user}
                      </TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{activity.whiteboard}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          {activity.time}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Content</CardTitle>
              <CardDescription>
                Content requiring moderation review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.content}
                      </TableCell>
                      <TableCell>{item.reporter}</TableCell>
                      <TableCell>{getSeverityBadge(item.severity)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          {item.time}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 mr-2"
                >
                  View All Flagged Content
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Go to Moderation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>System Usage</CardTitle>
          <CardDescription>Last 7 days performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-gray-500">28%</span>
              </div>
              <Progress value={28} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-gray-500">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm text-gray-500">62%</span>
              </div>
              <Progress value={62} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
