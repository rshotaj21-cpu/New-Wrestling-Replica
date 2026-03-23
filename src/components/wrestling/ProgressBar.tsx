interface ProgressBarProps {
  value: number;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({ value, className = "", barClassName = "" }: ProgressBarProps) {
  return (
    <div className={`w-full h-2 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${barClassName}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
