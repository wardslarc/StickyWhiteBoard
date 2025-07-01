import { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./components/homepage/home";
import routes from "tempo-routes";
import WhiteBoard from "./components/home";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProfile from "./components/userProfile/Profile";
import { Toaster } from "sonner";
import Board from "./components/boardmanager/Board";

// Admin components
import AdminLayout from "./components/admin/Admin";
import ContentModeration from "./components/admin/ContentModeration";
import DashboardOverview from "./components/admin/DashboardOverview";
import Settings from "./components/admin/Settings";
import SubscriptionBilling from "./components/admin/SubscriptionBilling";
import UserManagement from "./components/admin/UserManagement";

function App() {
  const location = useLocation();

  // Redirect /board/:id to /drawing/:id while maintaining all functionality
  if (location.pathname.startsWith('/board/') && location.pathname.split('/').length === 3) {
    const boardId = location.pathname.split('/')[2];
    return <Navigate to={`/drawing/${boardId}`} replace />;
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        {/* Board Management */}
        <Route 
          path="/board" 
          element={
            <ProtectedRoute>
              <Board />
            </ProtectedRoute>
          }
        />

        {/* Whiteboard - primary route */}
        <Route
          path="/drawing/:id"
          element={
            <ProtectedRoute>
              <WhiteBoard />
            </ProtectedRoute>
          }
        />

        {/* User Profile */}
        <Route
          path="/userProfile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="usermanagement" element={<UserManagement />} />
          <Route path="contentmoderation" element={<ContentModeration />} />
          <Route path="settings" element={<Settings />} />
          <Route path="subscriptionbilling" element={<SubscriptionBilling />} />
        </Route>

        {/* Tempo fallback routes */}
        {import.meta.env.VITE_TEMPO === "true" && routes}
      </Routes>

      <Toaster position="top-right" richColors />
    </Suspense>
  );
}

export default App;