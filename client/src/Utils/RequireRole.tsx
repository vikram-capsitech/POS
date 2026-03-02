import { Navigate } from "react-router-dom";
import { useSelector } from "../redux/store";

export default function RequireRole({
  role,
  children,
}: {
  role: string;
  children: JSX.Element;
}) {
  const { user } = useSelector((state: any) => state.auth);

  return user?.role === role ? children : <Navigate to="/error/403" replace />;
}
