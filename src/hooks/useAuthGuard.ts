import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function useAuthGuard() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const guard = (action: () => void) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    action();
  };

  return { guard };
}
