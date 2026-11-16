import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface PageTitleProps {
  children: ReactNode
  className?: string
}

function PageTitle({ children, className }: PageTitleProps) {
  return <h1 className={cn("text-2xl font-bold", className)}>{children}</h1>
}

interface PageSkeletonHeaderProps {
  className?: string
}

function PageSkeletonHeader({ className }: PageSkeletonHeaderProps) {
  return <Skeleton className={cn("h-8 w-56", className)} />
}

interface ToolbarSkeletonProps {
  className?: string
}

function ToolbarSkeleton({ className }: ToolbarSkeletonProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border bg-card px-4 py-3",
        className
      )}
    >
      <Skeleton className="h-5 w-4 shrink-0" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-44" />
      <Skeleton className="ml-auto hidden h-10 w-px bg-muted sm:block" />
      <Skeleton className="hidden h-4 w-32 sm:block" />
    </div>
  )
}

interface FilterBarSkeletonProps {
  className?: string
}

function FilterBarSkeleton({ className }: FilterBarSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex gap-3">
        <Skeleton className="h-11 w-44 rounded-lg" />
        <Skeleton className="h-11 w-32 rounded-lg" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>
    </div>
  )
}

interface StatCardsSkeletonProps {
  count?: number
  variant?: "card" | "compact"
  gridClassName?: string
  className?: string
}

function StatCardsSkeleton({
  count = 4,
  variant = "card",
  gridClassName,
  className,
}: StatCardsSkeletonProps) {
  const defaultGrid =
    variant === "compact"
      ? "grid grid-cols-2 gap-3 lg:grid-cols-4"
      : "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"

  return (
    <div className={cn(gridClassName ?? defaultGrid, className)}>
      {Array.from({ length: count }).map((_, i) =>
        variant === "compact" ? (
          <div key={i} className="rounded-xl bg-muted p-4">
            <Skeleton className="mb-2 h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        ) : (
          <div key={i} className="rounded-2xl border px-6 py-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-6 h-9 w-28" />
          </div>
        )
      )}
    </div>
  )
}

interface ChartCardsSkeletonProps {
  count?: number
  chartHeight?: string
  gridClassName?: string
  className?: string
}

function ChartCardsSkeleton({
  count = 4,
  chartHeight = "h-48",
  gridClassName = "grid grid-cols-1 gap-4 md:grid-cols-2",
  className,
}: ChartCardsSkeletonProps) {
  return (
    <div className={cn(gridClassName, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border px-6 pt-4 pb-6">
          <Skeleton className="mb-3 h-4 w-32" />
          <Skeleton className={cn("w-full", chartHeight)} />
        </div>
      ))}
    </div>
  )
}

interface ChartBlockSkeletonProps {
  chartHeight?: string
  className?: string
}

function ChartBlockSkeleton({
  chartHeight = "h-48",
  className,
}: ChartBlockSkeletonProps) {
  return (
    <div className={cn("rounded-xl bg-muted p-4", className)}>
      <Skeleton className="mb-4 h-4 w-32" />
      <Skeleton className={cn("w-full rounded", chartHeight)} />
    </div>
  )
}

interface MiniCardsSkeletonProps {
  count?: number
  className?: string
}

function MiniCardsSkeleton({ count = 6, className }: MiniCardsSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl bg-muted p-3">
          <Skeleton className="mb-1 h-3 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

interface PageSkeletonProps {
  title?: boolean
  titleText?: ReactNode
  titleClassName?: string
  statCards?: number
  chartCards?: number
  chartHeight?: string
  className?: string
}

function PageSkeleton({
  title = true,
  titleText,
  titleClassName,
  statCards = 4,
  chartCards = 4,
  chartHeight,
  className,
}: PageSkeletonProps) {
  return (
    <div className={cn("w-full space-y-6", className)}>
      {title &&
        (titleText !== undefined ? (
          <PageTitle className={titleClassName}>{titleText}</PageTitle>
        ) : (
          <PageSkeletonHeader />
        ))}
      {statCards > 0 && <StatCardsSkeleton count={statCards} />}
      {chartCards > 0 && (
        <ChartCardsSkeleton count={chartCards} chartHeight={chartHeight} />
      )}
    </div>
  )
}

interface TableSkeletonProps {
  columns?: number
  rows?: number
  headerHeight?: string
  rowHeight?: string
  titleText?: ReactNode
  titleClassName?: string
  className?: string
}

function TableSkeleton({
  columns = 4,
  rows = 6,
  headerHeight = "h-9",
  rowHeight = "h-12",
  titleText,
  titleClassName,
  className,
}: TableSkeletonProps) {
  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  }

  const table = (
    <div className={cn("rounded-xl border bg-card", className)}>
      <div
        className={cn("grid items-center gap-3 border-b px-3", headerHeight)}
        style={gridStyle}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3" />
        ))}
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={cn("grid items-center gap-3 px-3", rowHeight)}
            style={gridStyle}
          >
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full max-w-28" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )

  if (titleText === undefined) return table

  return (
    <div className="w-full space-y-6">
      <PageTitle className={titleClassName}>{titleText}</PageTitle>
      {table}
    </div>
  )
}

interface TableBodySkeletonProps {
  columns?: number
  rows?: number
  cellHeight?: string
}

function TableBodySkeleton({
  columns = 4,
  rows = 6,
  cellHeight = "h-4",
}: TableBodySkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b transition-colors last:border-0">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="p-3 align-middle whitespace-nowrap">
              <Skeleton className={cn(cellHeight, "w-full max-w-28")} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

interface CardGridSkeletonProps {
  cards?: number
  title?: boolean
  titleText?: ReactNode
  titleClassName?: string
  cardHeight?: string
  gridClassName?: string
  cardClassName?: string
  className?: string
}

function CardGridSkeleton({
  cards = 4,
  title = true,
  titleText,
  titleClassName,
  cardHeight = "h-44",
  gridClassName = "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
  cardClassName = "rounded-2xl",
  className,
}: CardGridSkeletonProps) {
  return (
    <div className={cn("w-full space-y-6", className)}>
      {title &&
        (titleText !== undefined ? (
          <PageTitle className={titleClassName}>{titleText}</PageTitle>
        ) : (
          <PageSkeletonHeader />
        ))}
      <div className={gridClassName}>
        {Array.from({ length: cards }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("w-full", cardClassName, cardHeight)}
          />
        ))}
      </div>
    </div>
  )
}

interface ListSkeletonProps {
  rows?: number
  itemHeight?: string
  className?: string
}

function ListSkeleton({
  rows = 6,
  itemHeight = "h-16",
  className,
}: ListSkeletonProps) {
  return (
    <div className={cn("w-full space-y-4", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={cn("rounded-2xl", itemHeight)} />
      ))}
    </div>
  )
}

export {
  PageSkeleton,
  PageTitle,
  PageSkeletonHeader,
  ToolbarSkeleton,
  FilterBarSkeleton,
  StatCardsSkeleton,
  ChartCardsSkeleton,
  ChartBlockSkeleton,
  MiniCardsSkeleton,
  TableSkeleton,
  TableBodySkeleton,
  CardGridSkeleton,
  ListSkeleton,
}
