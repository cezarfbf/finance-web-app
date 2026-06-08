import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getToken, getCurrentUser, logout } from "@/lib/api/auth";

export function RequireAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      setIsLoading(false);
      return;
    }

    // DEV bypass: skip backend validation when VITE_SKIP_AUTH=true
    if (import.meta.env.VITE_SKIP_AUTH === "true") {
      setIsAuthed(true);
      setIsLoading(false);
      return;
    }

    // Validate token with backend
    getCurrentUser()
      .then(() => setIsAuthed(true))
      .catch(() => {
        logout();
        navigate("/login", { replace: true });
      })
      .finally(() => setIsLoading(false));
  }, [navigate]);

  if (isLoading) {
    return null;
  }

  if (!isAuthed) {
    return null;
  }

  return <Outlet />;
}
