import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Aurélia" },
      { name: "description", content: "Sign in or create an account to book luxury suites at Aurélia." },
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
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [loading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast.success("Welcome to Aurélia!");
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
          toast.error(
            error.message.toLowerCase().includes("invalid")
              ? "Invalid email or password"
              : error.message,
          );
          return;
        }
        toast.success("Welcome back");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex min-h-[calc(100vh-160px)] items-center justify-center px-6 py-32">
        <div className="w-full max-w-md animate-fade-up rounded-2xl bg-gradient-card p-8 shadow-elegant">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              {mode === "signin" ? "Welcome back" : "Join Aurélia"}
            </p>
            <h1 className="mt-2 font-display text-3xl">
              {mode === "signin" ? "Sign in" : "Create your account"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="pl-9"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            {mode === "signin" && (
              <button onClick={handleForgot} className="hover:text-foreground" type="button">
                Forgot password?
              </button>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
