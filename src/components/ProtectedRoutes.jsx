import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, role, allowedRoles, children }) => {
  if (!user || !allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default ProtectedRoute;
