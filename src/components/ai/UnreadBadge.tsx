import { cn } from "@/lib/utils";

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

const UnreadBadge = ({ count, className }: UnreadBadgeProps) => {
  if (count <= 0) return null;

  return (
    <div
      className={cn(
        "absolute -top-1 -right-1 z-10",
        "min-w-[20px] h-5 px-1.5",
        "flex items-center justify-center",
        "bg-red-500 text-white",
        "text-xs font-bold rounded-full",
        "shadow-lg border-2 border-background",
        "animate-scale-in",
        className
      )}
      aria-label={`${count} unread messages`}
      role="status"
    >
      {count > 99 ? "99+" : count}
    </div>
  );
};

export default UnreadBadge;
