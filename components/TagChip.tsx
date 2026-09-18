import { tagLabel } from "@/lib/tags";

export function TagChip({ tag }: { tag: string }) {
  return (
    <span className="rounded-md bg-elevated px-1.5 py-0.5 text-[10.5px] text-muted">
      {tagLabel(tag)}
    </span>
  );
}
