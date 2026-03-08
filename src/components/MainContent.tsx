import { cn } from "@/lib/utils";

export default function MainContent({ className = "", children }: { className?: string, children?: React.ReactNode }) {
  return (
    <div className={cn("lg:max-w-480 h-max display flex ml-auto mr-auto", className)}>
      {children}
    </div>
  );
}