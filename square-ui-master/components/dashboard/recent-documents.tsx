"use client";

import React from "react";
import {
  Search,
  FileText,
  Mail,
  CheckSquare,
  File,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useDashboardStore } from "@/store/dashboard-store";
import { cn } from "@/lib/utils";

const iconMap = {
  files: FileText,
  mail: Mail,
  checklist: CheckSquare,
  file: File,
};

export function RecentDocuments() {
  const { recentOrders, recentAnalysis } = useDashboardStore();
  const [activeTab, setActiveTab] = React.useState<'orders' | 'analysis'>('orders');

  const items = activeTab === 'orders' ? recentOrders : recentAnalysis;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card max-h-[400px] flex flex-col">
      <div className="flex items-center justify-between px-4 pt-[15px] pb-4 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={cn(
              "text-[15px] font-medium tracking-[-0.45px] transition-colors",
              activeTab === 'orders' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Последние заказы
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={cn(
              "text-[15px] font-medium tracking-[-0.45px] transition-colors",
              activeTab === 'analysis' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Заявки на анализы
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            placeholder="Поиск..."
            className="h-7 w-[140px] sm:w-[180px] md:w-[235px] pl-8 pr-2 text-sm text-muted-foreground"
          />
        </div>
      </div>

      <div className="px-[14px] pb-4 overflow-y-auto flex-1">
        <div className="space-y-[8px]">
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs italic">
              Ничего не найдено
            </div>
          ) : (
            items.map((item: any) => {
              const Icon = iconMap.file;
              return (
                <div
                  key={item.id}
                  className="relative h-[46px] rounded-[10px] border border-border bg-sidebar hover:bg-sidebar-accent px-[7px]"
                >
                  <div className="grid h-full items-center gap-2 sm:gap-3 md:gap-4 overflow-hidden grid-cols-[1fr_auto_auto]">
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                      <div className="flex size-8 items-center justify-center rounded-[6px] border border-border bg-background shrink-0">
                        <Icon className="size-[18px] text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <p className="text-[14px] font-semibold text-foreground tracking-[-0.4px] truncate">
                          {item.user_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {activeTab === 'orders' ? `№${item.id}` : item.created_at}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeTab === 'orders' ? (
                        <span className="text-[13px] font-bold text-primary whitespace-nowrap">
                          {item.amount.toLocaleString()} сум
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          Запись
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                        item.status === 'pending' || item.status === 'scheduled' ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                      )}>
                        {item.status === 'pending' ? 'Ожидает' :
                          item.status === 'scheduled' ? 'Запланировано' :
                            item.status === 'completed' ? 'Завершено' : item.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-card to-transparent rounded-br-xl rounded-bl-xl" />
    </div>
  );
}
