import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/homepage/home";
import routes from "tempo-routes";
import WhiteBoard from "./components/home";
import ProtectedRoute from "./components/ProtectedRoute";
import UserProfile from "./components/userProfile/Profile";

// Admin layout and sub-pages
import AdminLayout from "./components/admin/admin";
import ContentModeration from "./components/admin/ContentModeration";
import DashboardOverview from "./components/admin/DashboardOverview";
import Settings from "./components/admin/Settings";
import SubscriptionBilling from "./components/admin/SubscriptionBilling";
import UserManagement from "./components/admin/UserManagement";

// ✅ Import the Toaster
import { Toaster } from "sonner";


function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />

        {/* Authenticated Users */}
        <Route
          path="/drawing"
          element={
            <ProtectedRoute>
              <WhiteBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/userProfile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* Admin layout with nested routes */}
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
      </Routes>

      {/* ✅ Global toaster rendered at the root of your app */}
      <Toaster />

      {/* Tempo fallback route system */}
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
    </Suspense>
  );
}

export default App;
