"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Search,
  Upload,
  Filter,
  CheckCircle2,
  CircleDashed,
  Calendar as CalendarIcon,
  Briefcase,
  Mail,
  Phone,
  Tag,
  MapPin,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useDashboardStore } from "@/store/dashboard-store";
import { cn } from "@/lib/utils";
import type { Person } from "@/mock-data/people";

const statusIcons = {
  active: CheckCircle2,
  offline: CircleDashed,
  away: CalendarIcon,
};

const statusColors = {
  active: "text-green-600",
  offline: "text-muted-foreground",
  away: "text-yellow-600",
};

export const columns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Имя
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const person = row.original;
      const name = person.username || person.name;
      const avatar = person.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${name}`;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-5 text-[10px]">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>
              {name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-foreground">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: () => (
      <div className="flex items-center gap-2">
        <Briefcase className="size-4 text-muted-foreground" />
        <span>Роль</span>
      </div>
    ),
    cell: ({ row }) => {
      const role = row.original.role || row.original.jobTitle || "Клиент";
      return <div className="text-sm text-foreground">{role}</div>;
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="flex items-center gap-2">
        <CircleDashed className="size-4 text-muted-foreground" />
        <span>Статус</span>
      </div>
    ),
    filterFn: (row, id, value) => {
      const status = row.getValue(id) as Person["status"];
      return value.includes(status);
    },
    cell: ({ row }) => {
      const status = (row.getValue("status") as Person["status"]) || "offline";
      const StatusIcon = statusIcons[status] || CircleDashed;
      return (
        <div className="flex items-center gap-1.5">
          <StatusIcon className={cn("size-3.5", statusColors[status] || "text-muted-foreground")} />
          <span className="text-sm capitalize text-foreground">
            {status === 'active' ? 'Активен' :
              status === 'offline' ? 'Оффлайн' :
                status === 'away' ? 'Отошел' : status}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm text-foreground lowercase">
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: () => (
      <div className="flex items-center gap-2">
        <Phone className="size-4 text-muted-foreground" />
        <span>Телефон</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-foreground">{row.getValue("phone")}</div>
    ),
  },
  {
    accessorKey: "tags",
    header: () => (
      <div className="flex items-center gap-2">
        <Tag className="size-4 text-muted-foreground" />
        <span>Теги</span>
      </div>
    ),
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[];
      return (
        <div className="flex flex-wrap gap-1">
          {tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "telegram_id",
    header: () => (
      <div className="flex items-center gap-2">
        <LinkIcon className="size-4 text-muted-foreground" />
        <span>Telegram</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-foreground">{row.getValue("telegram_id") || "-"}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: () => (
      <div className="flex items-center gap-2">
        <CalendarIcon className="size-4 text-muted-foreground" />
        <span>Дата рег.</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        {row.getValue("created_at")}
      </div>
    ),
  },
  {
    accessorKey: "address",
    header: () => (
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-muted-foreground" />
        <span>Адрес</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-foreground">{row.getValue("address")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const person = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Действия</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(person.id)}
            >
              Копировать ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Просмотр</DropdownMenuItem>
            <DropdownMenuItem>Детали</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function PeopleTable() {
  const { people } = useDashboardStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Fonction pour obtenir les filtres actifs
  const getStatusFilter = () => {
    const statusFilter = columnFilters.find((f) => f.id === "status");
    return statusFilter?.value as string[] | undefined;
  };

  const isStatusFiltered = (status: Person["status"]) => {
    const statusFilter = getStatusFilter();
    return statusFilter?.includes(status) ?? true;
  };

  const toggleStatusFilter = (status: Person["status"]) => {
    const currentFilter = getStatusFilter();
    const newFilter = currentFilter
      ? currentFilter.includes(status)
        ? currentFilter.filter((s) => s !== status)
        : [...currentFilter, status]
      : [status];

    setColumnFilters((prev) => {
      const otherFilters = prev.filter((f) => f.id !== "status");
      return newFilter.length > 0
        ? [...otherFilters, { id: "status", value: newFilter }]
        : otherFilters;
    });
  };

  const table = useReactTable({
    data: people,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 border-b border-border p-4">
        <div className="flex flex-1 items-center gap-2 sm:gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter emails..."
              value={
                (table.getColumn("email")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("email")?.setFilterValue(event.target.value)
              }
              className="h-7 pl-8 w-full"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-2 shrink-0"
              >
                <Filter className="size-3.5" />
                <span className="hidden sm:inline">Фильтр</span>
                {columnFilters.length > 0 && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                    {columnFilters.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Фильтр по статусу</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={isStatusFiltered("active")}
                onCheckedChange={() => toggleStatusFilter("active")}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-green-600" />
                  Активен
                </div>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={isStatusFiltered("offline")}
                onCheckedChange={() => toggleStatusFilter("offline")}
              >
                <div className="flex items-center gap-2">
                  <CircleDashed className="size-3.5 text-muted-foreground" />
                  Оффлайн
                </div>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={isStatusFiltered("away")}
                onCheckedChange={() => toggleStatusFilter("away")}
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon className="size-3.5 text-yellow-600" />
                  Отошел
                </div>
              </DropdownMenuCheckboxItem>
              {columnFilters.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setColumnFilters([])}
                    className="text-destructive"
                  >
                    Сбросить фильтры
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 hidden md:flex shrink-0"
              >
                Колонки <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-2 hidden lg:flex shrink-0"
        >
          <Upload className="size-3.5" />
          Импорт
        </Button>
      </div>

      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Нет результатов.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 border-t border-border p-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} из{" "}
          {table.getFilteredRowModel().rows.length} строк выбрано.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Назад
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Вперед
          </Button>
        </div>
      </div>
    </div>
  );
}
