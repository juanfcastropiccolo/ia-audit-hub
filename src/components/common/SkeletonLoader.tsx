
export interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
  width?: string;
}

export function Skeleton({
  className = "",
  lines = 1,
  height = "h-4",
  width = "w-full",
}: SkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array(lines)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={`animate-pulse bg-primary/10 rounded ${height} ${
              typeof width === 'string' ? width : `w-${width}`
            }`}
          />
        ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card-container p-4 animate-pulse">
      <div className="flex space-x-4">
        <div className="rounded-full bg-primary/10 h-10 w-10" />
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-primary/10 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-primary/10 rounded" />
            <div className="h-4 bg-primary/10 rounded w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({rows = 5, columns = 4}) {
  return (
    <div className="overflow-x-auto card-container">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-primary/5">
          <tr>
            {Array(columns)
              .fill(0)
              .map((_, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <div className="h-4 bg-primary/10 rounded w-20" />
                </th>
              ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {Array(rows)
            .fill(0)
            .map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array(columns)
                  .fill(0)
                  .map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-primary/10 rounded w-24" />
                    </td>
                  ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
