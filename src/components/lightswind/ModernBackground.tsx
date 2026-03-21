import { cn } from "@/lib/utils";

export function ModernBackground({ className }: { className?: string }) {
  return (
    <div 
      className={cn("fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50", className)} 
      aria-hidden="true"
    >
      {/* Elegant Fluid Abstract Glows */}
      
      {/* Top Left - Primary Sky Glow */}
      <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-[40%_60%_70%_30%] bg-sky-300/20 blur-[120px]" />
      
      {/* Bottom Right - Indigo Deep Glow */}
      <div className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-[60%_40%_30%_70%] bg-indigo-300/15 blur-[120px]" />
      
      {/* Center Ambient Accent - Cyan Light */}
      <div className="absolute top-[40%] right-[20%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-[50%] bg-cyan-200/15 blur-[100px]" />
    </div>
  );
}
