import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../firebase";
import { updatePassword, signOut } from "firebase/auth";

export default function UserProfileMenu(){
    const [menuOpen, setMenuOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    const handleChangePassword = async () => {
        if(auth.currentUser && newPassword.length >= 6){
            try{
                await updatePassword(auth.currentUser, newPassword);
                alert("Password updated!");
                setNewPassword("");
                setMenuOpen(false);
            } catch (err) {
                alert("Failed to update password: "+ err.message);
            }
            } else {
                alert("Password must be at least 6 characters")
            }
        };
    return(
        <div className = "relative inline-block text-left">
            <button
            onClick={()=> setMenuOpen(!menuOpen)}
            className="bg-gray-200 px-4 py-2 rounded hover: bg-gray-300">
                Profile
            </button>
            {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-10 p-4">
                    <div className="mb-2">
                        <input
                            type="password" 
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-2 border rounded mb-2"
                            />
                            <button
                                onClick={handleChangePassword}
                                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                            >
                                Change Password
                            </button>
                    </div>
                    <button
                        onClick={() => alert("Redirect to bug report form.")}
                        className="w-full text-left text-sm text-gray-700 hover:text-black mb-2">
                            Report a bug
                        </button>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left text-sm text-red-600 hover:text-red-800">
                            Logout
                    </button>
              </div>    
            )}
        </div>
    );
    }
