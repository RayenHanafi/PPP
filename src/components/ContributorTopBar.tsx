import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { Button } from "./ui";

export function ContributorTopBar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex justify-end">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      >
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </div>
  );
}
