"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  OnChangeFn,
} from "@tanstack/react-table"
import { ChevronUp, ChevronDown } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  // Add sorting props for BE sorting
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  // Add loading state
  loading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  sorting = [],
  onSortingChange,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    onSortingChange,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    // Remove getPaginationRowModel since we're using server-side pagination
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    // Disable manual sorting to prevent FE sorting
    manualSorting: !!onSortingChange,
  })

  return (
    <div className="w-full">
      <div className="rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sortDirection = header.column.getIsSorted()
                  
                  return (
                    <TableHead 
                      key={header.id}
                      className={canSort ? "cursor-pointer select-none" : ""}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center space-x-2">
                        <span>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </span>
                        {canSort && (
                          <div className="flex flex-col">
                            {sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : sortDirection === "desc" ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <div className="flex flex-col">
                                <ChevronUp className="h-3 w-3 text-muted-foreground" />
                                <ChevronDown className="h-3 w-3 text-muted-foreground -mt-1" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <span>Đang tải dữ liệu...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


