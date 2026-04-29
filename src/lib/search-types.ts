export type SearchItemType = "event" | "benefit" | "food" | "blog";

export interface SearchIndexItem {
  id: string;
  type: SearchItemType;
  typeLabel: string;
  title: string;
  summary: string;
  category: string;
  district: string;
  tags: string[];
  keywords: string[];
  href: string;
  provider: string;
  venue: string;
  dateLabel: string;
  startDate: string;
  endDate: string;
  updatedAt: string;
  isActive: boolean;
  isFree: boolean;
  isExternal: boolean;
}

export interface SearchIndexData {
  generatedAt: string;
  counts: Record<SearchItemType, number>;
  items: SearchIndexItem[];
}

export interface SearchFilters {
  query: string;
  type: SearchItemType | "all";
  district: string;
  activeOnly: boolean;
}
