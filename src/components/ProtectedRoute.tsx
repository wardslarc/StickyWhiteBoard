import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // Optional role: "admin", "user", etc.
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const role = userData.role || "user";

          if (!requiredRole || role === requiredRole) {
            setAuthorized(true);
          } else {
            console.warn("Unauthorized role:", role);
            navigate("/", { replace: true }); // Redirect non-authorized users
          }
        } else {
          console.warn("User document not found in Firestore");
          navigate("/", { replace: true });
        }
      } else {
        navigate("/", { replace: true }); // Redirect unauthenticated users
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, requiredRole]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{authorized ? children : null}</>;
};

export default ProtectedRoute;
