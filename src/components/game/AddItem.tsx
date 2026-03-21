import { Plus } from "lucide-react";

interface AddItemButtonProps {
  label: string;
  onClick: () => void;
}

export function AddItemButton({ label, onClick }: AddItemButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 rounded-2xl sm:rounded-3xl border-2 border-dashed border-border text-muted-foreground text-xs sm:text-sm hover:border-primary/40 hover:text-primary hover:bg-primary/5 active:scale-[0.98] transition-all duration-200 group"
    >
      <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
      {label}
    </button>
  );
}
