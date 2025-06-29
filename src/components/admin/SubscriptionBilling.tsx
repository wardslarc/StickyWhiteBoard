import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  CreditCard,
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Subscription {
  id: string;
  user: string;
  email: string;
  plan: string;
  status: "active" | "cancelled" | "expired" | "trial";
  amount: number;
  nextBilling: string;
  whiteboards: number;
  maxWhiteboards: number;
}

interface PaymentMethod {
  id: string;
  user: string;
  type: "card" | "paypal";
  last4?: string;
  brand?: string;
  status: "active" | "expired" | "failed";
}

const SubscriptionBilling = () => {
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data
  const subscriptions: Subscription[] = [
    {
      id: "sub_001",
      user: "John Doe",
      email: "john@example.com",
      plan: "Pro",
      status: "active",
      amount: 29.99,
      nextBilling: "2024-02-15",
      whiteboards: 8,
      maxWhiteboards: 20,
    },
    {
      id: "sub_002",
      user: "Jane Smith",
      email: "jane@example.com",
      plan: "Basic",
      status: "trial",
      amount: 9.99,
      nextBilling: "2024-01-20",
      whiteboards: 3,
      maxWhiteboards: 5,
    },
    {
      id: "sub_003",
      user: "Mike Johnson",
      email: "mike@example.com",
      plan: "Enterprise",
      status: "active",
      amount: 99.99,
      nextBilling: "2024-02-10",
      whiteboards: 45,
      maxWhiteboards: 100,
    },
    {
      id: "sub_004",
      user: "Sarah Wilson",
      email: "sarah@example.com",
      plan: "Pro",
      status: "cancelled",
      amount: 29.99,
      nextBilling: "2024-01-25",
      whiteboards: 12,
      maxWhiteboards: 20,
    },
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: "pm_001",
      user: "John Doe",
      type: "card",
      last4: "4242",
      brand: "Visa",
      status: "active",
    },
    {
      id: "pm_002",
      user: "Jane Smith",
      type: "card",
      last4: "5555",
      brand: "Mastercard",
      status: "active",
    },
    {
      id: "pm_003",
      user: "Mike Johnson",
      type: "paypal",
      status: "active",
    },
    {
      id: "pm_004",
      user: "Sarah Wilson",
      type: "card",
      last4: "1234",
      brand: "Visa",
      status: "expired",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      trial: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800",
      failed: "bg-red-100 text-red-800",
    };
    return (
      variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "trial":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "cancelled":
      case "expired":
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((sum, sub) => sum + sub.amount, 0);

  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === "active",
  ).length;
  const trialUsers = subscriptions.filter(
    (sub) => sub.status === "trial",
  ).length;

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Subscription & Billing Management
        </h1>
        <p className="text-gray-600">
          Manage user subscriptions, billing, and payment methods
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">+3 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trialUsers}</div>
            <p className="text-xs text-muted-foreground">Convert 65% to paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Payment Issues
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="plans">Plan Management</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Subscriptions</CardTitle>
              <CardDescription>
                Manage and monitor all user subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="search">Search Users</Label>
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-48">
                  <Label htmlFor="status-filter">Filter by Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Next Billing</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {subscription.user}
                            </div>
                            <div className="text-sm text-gray-500">
                              {subscription.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{subscription.plan}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(subscription.status)}
                            <Badge
                              className={getStatusBadge(subscription.status)}
                            >
                              {subscription.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>${subscription.amount}</TableCell>
                        <TableCell>{subscription.nextBilling}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {subscription.whiteboards}/
                            {subscription.maxWhiteboards} boards
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Monitor and manage user payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentMethods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell>
                          <div className="font-medium">{method.user}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            {method.type === "card" ? (
                              <span>
                                {method.brand} •••• {method.last4}
                              </span>
                            ) : (
                              <span>PayPal</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(method.status)}
                            <Badge className={getStatusBadge(method.status)}>
                              {method.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Update
                            </Button>
                            <Button variant="outline" size="sm">
                              Remove
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Plan</CardTitle>
                <CardDescription>Perfect for individuals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                  $9.99<span className="text-sm font-normal">/month</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Up to 5 whiteboards</li>
                  <li>• Basic collaboration</li>
                  <li>• 1GB storage</li>
                </ul>
                <div className="flex items-center justify-between">
                  <Label htmlFor="basic-active">Active</Label>
                  <Switch id="basic-active" defaultChecked />
                </div>
                <Button className="w-full" variant="outline">
                  Edit Plan
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pro Plan</CardTitle>
                <CardDescription>For growing teams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                  $29.99<span className="text-sm font-normal">/month</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Up to 20 whiteboards</li>
                  <li>• Advanced collaboration</li>
                  <li>• 10GB storage</li>
                  <li>• Priority support</li>
                </ul>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pro-active">Active</Label>
                  <Switch id="pro-active" defaultChecked />
                </div>
                <Button className="w-full" variant="outline">
                  Edit Plan
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise Plan</CardTitle>
                <CardDescription>For large organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                  $99.99<span className="text-sm font-normal">/month</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Unlimited whiteboards</li>
                  <li>• Enterprise features</li>
                  <li>• 100GB storage</li>
                  <li>• 24/7 support</li>
                  <li>• Custom integrations</li>
                </ul>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enterprise-active">Active</Label>
                  <Switch id="enterprise-active" defaultChecked />
                </div>
                <Button className="w-full" variant="outline">
                  Edit Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionBilling;
