import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function UserProfileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleProfileSettings = () => {
    navigate("/userProfile");
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
      >
        Profile
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-10 p-4">
          <button
            onClick={handleProfileSettings}
            className="w-full text-left text-sm text-gray-700 hover:text-black mb-2"
          >
            Profile Settings
          </button>

          <button
            onClick={() => alert("Redirect to bug report form.")}
            className="w-full text-left text-sm text-gray-700 hover:text-black mb-2"
          >
            Report a bug
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
