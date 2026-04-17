import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact - Aurelia Hotel" },
      { name: "description", content: "Contact Aurelia concierge for reservations, events, and travel assistance." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Message sent. Our concierge will reach out shortly.");
    setName("");
    setEmail("");
    setMessage("");
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <PageHero
          eyebrow="Contact"
          title="Your journey starts with one message"
          description="Whether you need airport pickup, private dining, or an extended stay plan, our team is here every day."
        />

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-5 lg:px-10">
          <div className="space-y-5 md:col-span-2">
            <InfoLine icon={MapPin} title="Address" value="21 Royal Avenue, Skyline District, New York" />
            <InfoLine icon={Phone} title="Phone" value="+1 (555) 014-2200" />
            <InfoLine icon={Mail} title="Email" value="stay@aurelia.hotel" />
            <InfoLine icon={Clock3} title="Concierge Desk" value="Open 24 hours, every day" />
          </div>

          <div className="md:col-span-3">
            <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card/50 p-7 sm:p-8">
              <h2 className="font-display text-3xl">Send us a note</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Share your stay dates, guest count, and anything else we should prepare.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-h-36"
                  placeholder="Tell us how we can help."
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="mt-6 bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
                size="lg"
              >
                {submitting ? "Sending..." : "Send message"}
              </Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function InfoLine({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof Mail;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
          <p className="mt-1 text-sm text-foreground/90">{value}</p>
        </div>
      </div>
    </div>
  );
}

