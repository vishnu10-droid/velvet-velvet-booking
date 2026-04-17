import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  className?: string;
};

export function MetricCard({ label, value, helper, className }: MetricCardProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card/50 p-6", className)}>
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-3 font-display text-4xl leading-none text-foreground">{value}</p>
      {helper ? <p className="mt-3 text-sm text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

