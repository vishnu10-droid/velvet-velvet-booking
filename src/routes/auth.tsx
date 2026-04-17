import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Lock, Mail, User as UserIcon } from "lucide-react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const DEMO_LOGIN_EMAIL = import.meta.env.VITE_DEMO_LOGIN_EMAIL ?? "demo@aurelia.hotel";
const DEMO_LOGIN_PASSWORD = import.meta.env.VITE_DEMO_LOGIN_PASSWORD ?? "Demo@123456";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in - Aurelia" },
      { name: "description", content: "Sign in or create an account to book luxury suites at Aurelia." },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, "Please enter your name").max(100),
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, loading, signInAsDemo } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ email, password, fullName });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: parsed.data.fullName },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes("already")) {
            toast.error("This email is already registered. Try signing in.");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Welcome to Aurelia.");
      } else {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });

        if (error) {
          const isDemoEmail = parsed.data.email.trim().toLowerCase() === DEMO_LOGIN_EMAIL.toLowerCase();
          const isDemoPassword = parsed.data.password === DEMO_LOGIN_PASSWORD;
          if (isDemoEmail && isDemoPassword) {
            signInAsDemo(parsed.data.email.trim().toLowerCase());
            toast.success("Signed in with demo account.");
            return;
          }

          toast.error(error.message.toLowerCase().includes("invalid") ? "Invalid email or password." : error.message);
          return;
        }

        toast.success("Welcome back.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Enter your email first.");
      return;
    }

    const result = signInSchema.pick({ email: true }).safeParse({ email });
    if (!result.success) {
      toast.error("Please enter a valid email.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password reset email sent.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex min-h-[calc(100vh-160px)] items-center justify-center px-6 py-32">
        <div className="w-full max-w-md animate-fade-up rounded-2xl bg-gradient-card p-8 shadow-elegant">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              {mode === "signin" ? "Welcome back" : "Join Aurelia"}
            </p>
            <h1 className="mt-2 font-display text-3xl">{mode === "signin" ? "Sign in" : "Create your account"}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" ? (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Jane Doe"
                    className="pl-9"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  className="pl-9"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
              size="lg"
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="hover:text-foreground"
              type="button"
            >
              {mode === "signin" ? "New here? Create account" : "Already a guest? Sign in"}
            </button>
            {mode === "signin" ? (
              <button onClick={handleForgotPassword} className="hover:text-foreground" type="button">
                Forgot password?
              </button>
            ) : null}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Back to home
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
