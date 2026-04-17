import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogOut, Menu, User as UserIcon, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/rooms", label: "Rooms" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-smooth ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-wide">
            Aur<span className="text-gradient-gold">é</span>lia
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-link text-sm font-medium text-foreground/80 hover:text-foreground"
              activeProps={{ className: "nav-link active text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="nav-link text-sm font-medium text-foreground/80 hover:text-foreground"
              activeProps={{ className: "nav-link active text-foreground" }}
            >
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="nav-link text-sm font-medium text-primary hover:text-primary"
              activeProps={{ className: "nav-link active text-primary" }}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/80 transition-smooth hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/80 transition-smooth hover:bg-secondary hover:text-foreground"
            >
              <UserIcon className="h-4 w-4" />
              Sign in
            </Link>
          )}
          <Link
            to="/rooms"
            className="rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-bounce hover:scale-105"
          >
            Book Now
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-foreground"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-primary hover:bg-secondary"
              >
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-foreground"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-foreground"
              >
                Sign in
              </Link>
            )}
            <Link
              to="/rooms"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-gradient-gold px-6 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-gold"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
