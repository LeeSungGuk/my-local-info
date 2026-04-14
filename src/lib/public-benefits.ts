import { promises as fs } from "fs";
import path from "path";
import { sortBenefits } from "@/lib/benefit-utils";

export interface PublicBenefitsSource {
  provider: string;
  dataset: string;
  services: string[];
  region: string;
  officialUrl: string;
  apiBase: string;
  collectedAt: string;
  syncSchedule?: string;
  availableCount: number;
  fetchedCount: number;
  activeCount?: number;
  expiredCount?: number;
  deduplicatedCount?: number;
  filterMode: string;
  pageSize: number;
}

export interface PublicBenefitSummary {
  id: string;
  sourceId: string;
  title: string;
  field: string;
  provider: string;
  providerType: string;
  district: string;
  userType: string;
  deadlineText: string;
  deadlineSortKey: string;
  isAlwaysOpen: boolean;
  targetSummary: string;
  summary: string;
  supportType: string;
  supportSummary: string;
  receptionAgency: string;
  applicationMethodTypes: string[];
  detailUrl: string;
  onlineUrl: string;
  inquiry: string[];
  updatedAt: string;
  registeredAt: string;
}

export interface PublicBenefitDetail extends PublicBenefitSummary {
  collectedAt: string;
  purpose: string;
  target: string;
  selectionCriteria: string;
  supportContent: string;
  applicationMethod: string;
  documents: string;
  officialDocuments: string;
  identityDocuments: string;
  legalBasis: string[];
  ordinance: string;
  inquiryText: string;
  ageMin: number | null;
  ageMax: number | null;
  viewCount: number;
}

export interface PublicBenefitsIndex {
  source: PublicBenefitsSource;
  items: PublicBenefitSummary[];
}

const benefitsDataDir = path.join(process.cwd(), "public", "data", "benefits");
const benefitItemsDir = path.join(benefitsDataDir, "items");

const emptyIndex: PublicBenefitsIndex = {
  source: {
    provider: "공공데이터포털",
    dataset: "대한민국 공공서비스(혜택) 정보",
    services: ["serviceList", "serviceDetail", "supportConditions"],
    region: "서울특별시",
    officialUrl: "https://www.data.go.kr/data/15113968/openapi.do",
    apiBase: "https://api.odcloud.kr/api/gov24/v3",
    collectedAt: "",
    syncSchedule: "매일 오전 7시 30분",
    availableCount: 0,
    fetchedCount: 0,
    activeCount: 0,
    expiredCount: 0,
    deduplicatedCount: 0,
    filterMode: "서울 소관기관",
    pageSize: 1000,
  },
  items: [],
};

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const fileContents = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContents) as T;
  } catch {
    return null;
  }
}

export async function getBenefitsIndex(): Promise<PublicBenefitsIndex> {
  const indexPath = path.join(benefitsDataDir, "index.json");
  return (await readJsonFile<PublicBenefitsIndex>(indexPath)) ?? emptyIndex;
}

export async function getAllBenefits(): Promise<PublicBenefitSummary[]> {
  const index = await getBenefitsIndex();
  return sortBenefits(index.items);
}

export async function getFeaturedBenefits(limit = 6): Promise<PublicBenefitSummary[]> {
  const benefits = await getAllBenefits();
  return benefits.slice(0, limit);
}

export async function getBenefitById(id: string): Promise<PublicBenefitDetail | null> {
  const itemPath = path.join(benefitItemsDir, `${id}.json`);
  const detail = await readJsonFile<PublicBenefitDetail>(itemPath);

  if (detail) {
    return detail;
  }

  const benefits = await getAllBenefits();
  const summary = benefits.find((benefit) => benefit.id === id);

  if (!summary) {
    return null;
  }

  return {
    ...summary,
    collectedAt: "",
    purpose: "",
    target: summary.targetSummary,
    selectionCriteria: "",
    supportContent: summary.supportSummary,
    applicationMethod: "",
    documents: "",
    officialDocuments: "",
    identityDocuments: "",
    legalBasis: [],
    ordinance: "",
    inquiryText: summary.inquiry.join("\n"),
    ageMin: null,
    ageMax: null,
    viewCount: 0,
  };
}
