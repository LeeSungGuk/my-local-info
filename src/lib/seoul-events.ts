import { promises as fs } from "fs";
import path from "path";

export interface SeoulEventsSource {
  provider: string;
  dataset: string;
  service: string;
  region: string;
  officialUrl: string;
  apiBase: string;
  collectedAt: string;
  availableCount: number;
  fetchedCount: number;
  sampleMode: boolean;
  startDateFilter?: string;
}

export interface SeoulEventSummary {
  id: string;
  sourceId: string;
  title: string;
  category: string;
  district: string;
  venue: string;
  startDate: string;
  endDate: string;
  dateText: string;
  timeText: string;
  target: string;
  fee: string;
  isFree: boolean;
  organizer: string;
  inquiry: string;
  imageUrl: string;
  detailUrl: string;
  summary: string;
}

export interface SeoulEventDetail extends SeoulEventSummary {
  organizerUrl: string;
  ticketType: string;
  description: string;
  performer: string;
  program: string;
  latitude: number | null;
  longitude: number | null;
  registeredAt: string;
  collectedAt: string;
}

export interface SeoulEventsIndex {
  source: SeoulEventsSource;
  items: SeoulEventSummary[];
}

const eventsDataDir = path.join(process.cwd(), "public", "data", "events");
const eventsItemsDir = path.join(eventsDataDir, "items");

const emptyIndex: SeoulEventsIndex = {
  source: {
    provider: "서울 열린데이터광장",
    dataset: "서울시 문화행사 정보",
    service: "culturalEventInfo",
    region: "서울특별시",
    officialUrl: "https://data.seoul.go.kr/dataList/OA-15486/S/1/datasetView.do",
    apiBase: "http://openapi.seoul.go.kr:8088",
    collectedAt: "",
    availableCount: 0,
    fetchedCount: 0,
    sampleMode: false,
    startDateFilter: "2026-01-01",
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

export async function getEventsIndex(): Promise<SeoulEventsIndex> {
  const indexPath = path.join(eventsDataDir, "index.json");
  return (await readJsonFile<SeoulEventsIndex>(indexPath)) ?? emptyIndex;
}

export async function getAllEvents(): Promise<SeoulEventSummary[]> {
  const index = await getEventsIndex();
  return index.items;
}

export async function getFeaturedEvents(limit = 6): Promise<SeoulEventSummary[]> {
  const events = await getAllEvents();
  return events.slice(0, limit);
}

export async function getEventById(id: string): Promise<SeoulEventDetail | null> {
  const itemPath = path.join(eventsItemsDir, `${id}.json`);
  const detail = await readJsonFile<SeoulEventDetail>(itemPath);

  if (detail) {
    return detail;
  }

  const events = await getAllEvents();
  const summary = events.find((event) => event.id === id);

  if (!summary) {
    return null;
  }

  return {
    ...summary,
    organizerUrl: "",
    ticketType: "",
    description: "",
    performer: "",
    program: "",
    latitude: null,
    longitude: null,
    registeredAt: "",
    collectedAt: "",
  };
}

export function formatEventPeriod(event: Pick<SeoulEventSummary, "startDate" | "endDate">) {
  if (!event.startDate && !event.endDate) {
    return "일정 정보 없음";
  }

  if (event.startDate && event.endDate && event.startDate !== event.endDate) {
    return `${event.startDate} ~ ${event.endDate}`;
  }

  return event.startDate || event.endDate;
}
