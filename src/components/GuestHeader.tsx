import { NavLink } from "react-router-dom";
import { Button } from "./ui/button";

export function GuestHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 sm:px-6">
      <NavLink to="/">
        <img src="/logo.svg" alt="Logo" className="h-5 w-auto" />
      </NavLink>
      <Button asChild size="sm">
        <NavLink to="/login">Sign in</NavLink>
      </Button>
    </header>
  );
}
