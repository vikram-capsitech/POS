import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "../redux/store";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { isLoggedIn } = useSelector(
    (state: any) => state.auth
  );
  const location = useLocation();

  return isLoggedIn ? (
    children
  ) : (
    <Navigate to="/auth/login" state={{ from: location }} replace />
  );
}
