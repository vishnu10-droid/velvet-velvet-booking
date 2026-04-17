import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "customer";
export type AuthUser = Pick<User, "id" | "email" | "user_metadata"> & {
  isDemo?: boolean;
};

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  signInAsDemo: (email: string) => void;
}

const DEMO_SESSION_KEY = "aurelia-demo-session-v1";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function createDemoUser(email: string): AuthUser {
  return {
    id: "demo-user-local",
    email,
    user_metadata: { full_name: "Demo Guest" },
    isDemo: true,
  };
}

function readDemoSession() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { email?: string };
    if (!parsed.email) return null;
    return createDemoUser(parsed.email);
  } catch {
    return null;
  }
}

function writeDemoSession(email: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ email }));
}

function clearDemoSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_SESSION_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async (userId: string) => {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (error) {
      console.error("[auth] fetch roles error", error);
      setRoles([]);
      return;
    }
    setRoles((data ?? []).map((item) => item.role as AppRole));
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession?.user) {
        clearDemoSession();
        setSession(newSession);
        setUser(newSession.user);
        setTimeout(() => fetchRoles(newSession.user.id), 0);
        return;
      }

      const demoUser = readDemoSession();
      if (demoUser) {
        setSession(null);
        setUser(demoUser);
        setRoles(["customer"]);
      } else {
        setSession(null);
        setUser(null);
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      if (existing?.user) {
        setSession(existing);
        setUser(existing.user);
        fetchRoles(existing.user.id);
      } else {
        const demoUser = readDemoSession();
        if (demoUser) {
          setSession(null);
          setUser(demoUser);
          setRoles(["customer"]);
        } else {
          setSession(null);
          setUser(null);
          setRoles([]);
        }
      }
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    clearDemoSession();
    setRoles([]);
    setSession(null);
    setUser(null);
    await supabase.auth.signOut();
  };

  const refreshRoles = async () => {
    if (user && !user.isDemo) await fetchRoles(user.id);
  };

  const signInAsDemo = (email: string) => {
    writeDemoSession(email);
    setSession(null);
    setUser(createDemoUser(email));
    setRoles(["customer"]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        roles,
        loading,
        isAdmin: !user?.isDemo && roles.includes("admin"),
        isAuthenticated: !!user,
        signOut,
        refreshRoles,
        signInAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

