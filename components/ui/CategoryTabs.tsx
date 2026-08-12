"use client";

interface CategoryTabsProps {
  categories: { key: string; label: string; count: number }[];
  activeCategory: string;
  onChange: (key: string) => void;
}

export default function CategoryTabs({
  categories,
  activeCategory,
  onChange,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-[2px] pl-[14px] overflow-x-auto hide-scrollbar">
      {categories.map((cat) => {
        const isActive = cat.key === activeCategory;
        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onChange(cat.key)}
            className={`
              font-serif text-[12.5px] font-semibold
              px-[18px] pt-[9px] pb-[11px]
              rounded-t-[8px] rounded-b-none
              border border-line border-b-0
              cursor-pointer relative
              transition-all duration-200 ease
              whitespace-nowrap shrink-0
              ${isActive
                ? "bg-card text-ink top-0 z-[2] shadow-[0_-3px_10px_-6px_rgba(43,38,32,0.2)]"
                : "bg-paper-deep text-ink-soft top-[2px] hover:text-ink"
              }
            `}
          >
            {cat.label} ({cat.count})
          </button>
        );
      })}
    </div>
  );
}
