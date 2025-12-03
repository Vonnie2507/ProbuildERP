import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ChevronUp, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface Action<T> {
  label: string;
  onClick: (item: T) => void;
  destructive?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export function DataTable<T extends object>({
  data,
  columns,
  actions,
  onRowClick,
  keyExtractor,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as Record<string, unknown>)[sortKey];
    const bVal = (b as Record<string, unknown>)[sortKey];
    if (aVal === bVal) return 0;
    const comparison = aVal! < bVal! ? -1 : 1;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={column.sortable ? "cursor-pointer select-none" : ""}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortable && sortKey === column.key && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )
                  )}
                </div>
              </TableHead>
            ))}
            {actions && actions.length > 0 && (
              <TableHead className="w-12" />
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow
              key={keyExtractor(item)}
              className={onRowClick ? "cursor-pointer hover-elevate" : ""}
              onClick={() => onRowClick?.(item)}
              data-testid={`row-${keyExtractor(item)}`}
            >
              {columns.map((column) => (
                <TableCell key={String(column.key)}>
                  {column.render
                    ? column.render(item)
                    : String((item as Record<string, unknown>)[column.key as string] ?? "")}
                </TableCell>
              ))}
              {actions && actions.length > 0 && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-actions-${keyExtractor(item)}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions.map((action) => (
                        <DropdownMenuItem
                          key={action.label}
                          onClick={() => action.onClick(item)}
                          className={action.destructive ? "text-destructive" : ""}
                        >
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
