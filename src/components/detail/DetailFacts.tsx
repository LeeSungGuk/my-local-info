import { isMeaningfulFactValue } from "@/lib/detail-facts";

export interface DetailFact {
  label: string;
  value: string | null | undefined;
}

export default function DetailFacts({
  facts,
  variant = "list",
  className = "",
}: {
  facts: DetailFact[];
  variant?: "key" | "list";
  className?: string;
}) {
  const visibleFacts = facts.filter((fact): fact is { label: string; value: string } =>
    isMeaningfulFactValue(fact.value)
  );

  if (visibleFacts.length === 0) {
    return null;
  }

  const isKey = variant === "key";

  return (
    <dl
      className={`grid gap-x-8 ${isKey ? "gap-y-4 sm:grid-cols-3" : "gap-y-5 sm:grid-cols-2"} ${className}`}
    >
      {visibleFacts.map((fact) => (
        <div key={fact.label} className="min-w-0 border-t border-slate-200 pt-3">
          <dt className="text-xs font-semibold text-slate-500">{fact.label}</dt>
          <dd
            className={`mt-1 whitespace-pre-line leading-relaxed text-slate-900 ${
              isKey ? "text-base font-bold" : "text-sm font-medium"
            }`}
          >
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
