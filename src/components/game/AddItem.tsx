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
      className="w-full flex items-center justify-center gap-2 py-4 rounded-3xl border-2 border-dashed border-border text-muted-foreground text-sm hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200 group"
    >
      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
      {label}
    </button>
  );
}
