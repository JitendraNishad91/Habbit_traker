import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const userId = localStorage.getItem("userId");
  const location = useLocation();

  if (!userId) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
