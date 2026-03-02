import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../Store/store";

type Props = { children: React.ReactNode };

export default function RequireAuth({ children }: Props) {
  const location = useLocation();
  const token = useAuthStore((s) => s.session.token);
  const isAuthed = Boolean(token);

  if (!isAuthed) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }
  return <>{children}</>;
}
