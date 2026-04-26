import { GuestHeader } from "@/components/GuestHeader";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <GuestHeader />
      <div className="flex flex-1 flex-col gap-4 sm:gap-6 px-4 sm:px-6">
        <Outlet />
      </div>
    </div>
  );
}
