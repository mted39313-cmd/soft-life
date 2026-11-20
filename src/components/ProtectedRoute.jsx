import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
//Wasee humjasign in izeni mtarudishwa back tu login
function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
// calls lazima tutashika
export default ProtectedRoute; 