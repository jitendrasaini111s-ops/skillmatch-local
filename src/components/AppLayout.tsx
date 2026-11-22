import type { ReactNode } from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Badge } from "@/components/app-ui";
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  Search,
  Shield,
  UserCircle,
  PlusCircle,
} from "lucide-react";

const baseLink =
  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors";
const inactiveLink = `${baseLink} text-body hover:bg-primary-soft hover:text-primary-strong`;
const activeLink = `${baseLink} bg-primary text-primary-foreground`;

function NavItem({
  to,
  children,
  exact = false,
}: {
  to: "/jobs" | "/profile" | "/post-job" | "/dashboard" | "/admin";
  children: ReactNode;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      className={inactiveLink}
      activeProps={{ className: activeLink }}
      activeOptions={{ exact }}
    >
      {children}
    </Link>
  );
}

function NavLinks({ short = false }: { short?: boolean }) {
  const { profile, isAdmin } = useCurrentUser();
  return (
    <>
      <NavItem to="/jobs">
        <Search className="h-4 w-4" /> {short ? "Jobs" : "Find Jobs"}
      </NavItem>
      {profile?.role === "worker" && (
        <NavItem to="/profile">
          <UserCircle className="h-4 w-4" /> {short ? "Profile" : "My Profile"}
        </NavItem>
      )}
      {profile?.role === "client" && (
        <NavItem to="/post-job">
          <PlusCircle className="h-4 w-4" /> {short ? "Post Job" : "Post a Job"}
        </NavItem>
      )}
      <NavItem to="/dashboard">
        <LayoutDashboard className="h-4 w-4" /> Dashboard
      </NavItem>
      {isAdmin && (
        <NavItem to="/admin">
          <Shield className="h-4 w-4" /> Admin
        </NavItem>
      )}
    </>
  );
}

export default function AppLayout() {
  const { profile } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-foreground">
              SkillMatch <span className="text-primary">Local</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-3">
            {profile && (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-foreground">
                  {profile.full_name || "Welcome"}
                </p>
                <Badge tone={profile.role === "client" ? "blue" : "green"}>
                  {profile.role === "client" ? "Client" : "Worker"}
                </Badge>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-surface hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto border-t border-border-soft px-4 py-2 md:hidden">
          <NavLinks short />
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card py-6">
        <p className="text-center text-sm text-subtle">
          SkillMatch Local — connecting neighborhoods, one gig at a time.
        </p>
      </footer>
    </div>
  );
}
