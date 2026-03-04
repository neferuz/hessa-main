"use client";

import { Users, Clipboard, Wallet, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  users: Users,
  clipboard: Clipboard,
  wallet: Wallet,
  invoice: FileText,
};

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof iconMap;
  trend?: string;
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  const Icon = iconMap[icon];
  const isPositive = trend?.startsWith('+');

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
            {trend && (
              <span className={cn(
                "text-[10px] font-black px-1.5 py-0.5 rounded-md",
                isPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
              )}>
                {trend}
              </span>
            )}
          </div>
        </div>
        <div className="flex size-16 items-center justify-center rounded-lg bg-muted border border-border">
          <Icon className="size-8 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

